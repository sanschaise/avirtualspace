





    /////////////////////
   //                 //
  //   ALL Players   //
 //                 //
/////////////////////


//  The global “players” variable is really a glorified Array.
//  When an instance of Player() is created the instance is 
//  pushed onto this stack. And there is much rejoicing. 

var players = []

players.findById = {}




//  Should this be where comms.js setup actually exists?

players.setup = function(){}


players.update = function(){

	var 
	cameraWorld,
	targetWorld,
	aimingWorld


	cameraWorld = camera.position.clone()//  Already in World coordinate space.
	targetWorld = cameraWorld.clone()
	aimingWorld = cameraGaze.getWorldPosition()
	if( o.self.isWalking ){


		//  For now we’re not allowing flying
		//  and for some reason the body’s Y is not at zero
		//  so we’ll just keep on whatever Y we’re at.
		//  But for X and Z we’ll just lerp.

		targetWorld.x += ( aimingWorld.x - cameraWorld.x ) * 0.004
		targetWorld.z += ( aimingWorld.z - cameraWorld.z ) * 0.004


		//  Move the camera.
		//  Thankfully the camera is in World space
		//  so no need for conversion from World to Local.
		
		camera.position.set(

			targetWorld.x,
			targetWorld.y,
			targetWorld.z
		)
		camera.updateMatrixWorld()
		camera.lookAt( cameraGaze.getWorldPosition() )


		//  Move ourselves.
		//  We should --  in theory -- just be able to move our
		//  avatar position by the same amount as the camera move!
		/*
		targetWorld = o.self.avatar.position.clone()
		targetWorld.x += ( aimingWorld.x - cameraWorld.x ) * 0.003
		targetWorld.z += ( aimingWorld.z - cameraWorld.z ) * 0.003

		o.self.avatar.position.set( 

			targetWorld.x, 
			targetWorld.y,
			targetWorld.z
		)
		o.self.avatar.updateMatrixWorld()
		*/
		o.self.positionAvatarToCamera()


		//  Tell everyone else where we are.

		o.sendAvatarPositionVolatile()


		if( window.controls ){

			//players.self.gazeThru.position = players.self.head.worldToLocal( cameraGaze.getWorldPosition())
			o.self.head.lookAt( o.self.avatar.worldToLocal( cameraGaze.getWorldPosition() ))
		}		
	}
	o.sendGazePositionVolatile()
	players.forEach( function( player ){

		if( player.label ) player.label.lookAt( player.avatar.worldToLocal( camera.getWorldPosition() ))
		//player.checkForLasers2()
	})
	//players.getGazeIntersects()
}


//  GAZE INTERSECTIONS.

players.getGazeIntersects = function(){


	var 
	limit = players.length,
	objectsToCheck = players.map( function( player ){ return player.avatar })


	//  objectsToCheck.unshift( emitter )
	//  objectsToCheck.unshift( lightBulb )

	players.forEach( function( player ){

		var
		raycaster = new THREE.Raycaster(),
		intersects,
		gazeFromWorld,
		gazeThruWorld,
		gazeDirection

		gazeFromWorld = player.gazeFrom.getWorldPosition()
		gazeThruWorld = player.gazeThru.getWorldPosition()
		gazeDirection = gazeThruWorld.sub( gazeFromWorld )
		raycaster.set( gazeFromWorld, gazeDirection.normalize() )
		intersects = raycaster.intersectObjects( objectsToCheck )
		intersects.forEach( function( intersect ){

			intersect.object.material.color = player.color
			intersect.object.material.needsUpdate = true
			intersect.object.gazingAt = true
		})
		objectsToCheck.pop()
	})
}








    /////////////////////
   //                 //
  //   EACH Player   //
 //                 //
/////////////////////


//  At its heart a Player instance is just a handful of values,
//  the visible avatar is accordingly created by a separate function.

function Player( data ){

	this.isSelf   = data.isSelf || false
	this.addId( data.id )
	this.hueValue = data.hueValue
	this.hueName  = data.hueName
	this.animal   = data.animal
	this.name     = data.name
	this.color    = new THREE.Color( 'hsl('+ this.hueValue +',100%,50%)' )
	this.createAvatar()
	
	this.isReceivingLaser  = false
	this.wasReceivingLaser = false
	this.isReceivingLaserFromMe  = false
	this.wasReceivingLaserFromMe = false
	this.isEmittingLaser   = false
	this.wasEmittingLaser  = false

	players.push( this )


	//  Also -- it’s nice to hold on to a Hue Value and Animal Name
	//  across page loads. So let’s do that.
	//  OH WAIT. There’s more. If you’re using Private Browsing in Safari for iOS
	//  then window.sessionStorage will be defined (normal behavior) but if you
	//  attempt to set a key it will error out! AAAAAHHHHHHH! Took forever to discover
	//  this. So using Try / Catch as a last resort.

	try {

		if( window.sessionStorage !== undefined ){

			sessionStorage.setItem( 'hueValue', this.hueValue )
			sessionStorage.setItem( 'animal', this.animal )
		}		
	}
	catch( error ){

		console.log( 'What is this, Private Browsing on Safari for iOS?!', error )
	}

}
Player.prototype.removeSessionStorage = function(){

	try {

		if( window.sessionStorage !== undefined ){
	
			sessionStorage.removeItem( 'hueValue' )
			sessionStorage.removeItem( 'animal' )
		}		
	}
	catch( error ){

		console.log( 'What is this, Private Browsing on Safari for iOS?!', error )
	}
}
Player.prototype.addId = function( id ){

	this.id = id
	players.findById[ id ] = this
}




//  GET GAZE INTERSECTIONS.
//  What object -- if any -- is this player looking at?

Player.prototype.getGazeIntersects = function(){

	var
	raycaster = new THREE.Raycaster(),
	intersects,
	gazeFromWorld,
	gazeThruWorld,
	gazeDirection,
	player = this

	gazeFromWorld = this.gazeFrom.getWorldPosition()
	gazeThruWorld = this.gazeThru.getWorldPosition()
	gazeDirection = gazeThruWorld.sub( gazeFromWorld )
	raycaster.set( gazeFromWorld, gazeDirection.normalize() )
	intersects = raycaster.intersectObjects( players.map( function( player ){ return player.avatar }))
	intersects.forEach( function( intersect ){

		intersect.object.material.color = player.color
		intersect.object.material.needsUpdate = true
		intersect.object.gazingAt = true
	})
}




//  So how do you SEE a Player? 
//  We ought to create a visible avatar for it.

Player.prototype.createAvatar = function(){

	var 	
	avatar, height,
	bodyHeight, torso, legs, 
	headRadius, head, nose, loader,
	gaze, gazeFrom, gazeThru,
	canvas, context, texture, label


	//  HEIGHT.
	//  We’re expecting that the head of the avatar will have a 
	//  radius of 1 unit and that the eyes are located halfway up
	//  the head. This means we’re gazing from the top of the 
	//  head -- this.height -- minus the head’s radius.

	height = 6


	//  AVATAR.
	//  Includes all body parts, head, gaze lines, etc.
	//  Position = location of feet, ie. Y = 0.
	//  Note this 3D Object is being added to the WORLD
	//  coordinate space. All avatar components will then
	//  exist encapsulated in the avatar’s LOCAL space.

	avatar = new THREE.Object3D()
	avatar.position.set( 0, 0, 0 )
	avatar.lookAt( new THREE.Vector3( 0, 0, 0 ))
	avatar.name = this.name
	avatar.visible = true
	if( this.isSelf === true ) avatar.visible = false
	this.avatar = avatar
	scene.add( avatar )


	//  BODY = TORSO + LEGS.

	bodyHeight = height - 3.03
	torso = new THREE.Mesh( 

		new THREE.CylinderGeometry( 0.6, 0.8, bodyHeight/3, 32 ),
		new THREE.MeshPhongMaterial({

			color:   this.color,
			side:    THREE.FrontSide,
			visible: true
		})
	)
	torso.position.set( 0, bodyHeight/6*5, 0 )
	torso.castShadow    = true
	torso.receiveShadow = true
	torso.name = 'torso'
	avatar.add( torso )
	legs = new THREE.Mesh( 

		new THREE.CylinderGeometry( 0.8, 0.4, bodyHeight/3*2, 32 ),
		new THREE.MeshPhongMaterial({

			color:   this.color,
			side:    THREE.FrontSide,
			visible: true
		})
	)
	legs.position.set( 0, bodyHeight/3, 0 )
	legs.castShadow    = true
	legs.receiveShadow = true
	legs.name = 'legs'
	avatar.add( legs )


	//  HEAD.
	//  head === this.avatar.getObjectByName( 'head' )

	headRadius = 1
	head = new THREE.Mesh( 

		new THREE.SphereGeometry( headRadius, 32, 32 ),
		new THREE.MeshPhongMaterial({

			color: this.color,
			side:  THREE.FrontSide
		})
	)
	loader = new THREE.TextureLoader()
	loader.load( 'media/face-eyes.png', function( texture ){

		head.material.map = texture
		head.material.needsUpdate = true
	})
	head.rotation.set( 0, Math.PI / -2, 0 )
	head.updateMatrix()
	head.geometry.applyMatrix( head.matrix )
	head.position.set( 0, 0, 0 )
	head.rotation.set( 0, 0, 0 )
	head.scale.set( 1, 1, 1 )
	head.updateMatrix()
	head.position.set( 0, height - headRadius * 2, 0 )
	head.castShadow    = true
	head.receiveShadow = true
	head.name = 'head'
	this.head =  head
	avatar.add(  head )


	//  NOSE.

	nose = new THREE.Mesh(

		new THREE.SphereGeometry( 0.2, 32, 32 ),
		noseMaterial = new THREE.MeshPhongMaterial({

			color: this.color,
			side:  THREE.FrontSide
		})
	)
	nose.position.set( 0, -0.3, 1.1 )
	nose.castShadow    = true
	nose.receiveShadow = true
	nose.name = 'nose'
	head.add( nose )


	//  GAZE.
	//  The from and thru markers necessary for math
	//  like detecting gaze intersection.

	gazeFrom = new THREE.Object3D()
	//  ISSUE: Gaze should come from front of face, not center of head. But need center of head for gaze rotation...
	//  gazeFrom.position.set( 0, 0.1, 1.4 )
	gazeFrom.position.set( 0, 0.1, 0 )
	gazeFrom.name = 'gazeFrom'
	this.gazeFrom =  gazeFrom
	head.add( gazeFrom )
	
	gazeThru = new THREE.Object3D()
	gazeThru.position.set( 0, 0.1, 60 )
	gazeThru.name = 'gazeThru'
	this.gazeThru =  gazeThru
	head.add( gazeThru )


	//  Gaze visual indicator. 
	//  Not necessary for math, UI only.

	gaze = new THREE.Line( 

		new THREE.Geometry(),
		new THREE.LineBasicMaterial({ 

			color:       this.color,
			linewidth:   1,
			transparent: true,
			opacity:     0.2
		})
	)
	gaze.geometry.vertices.push(

		gazeFrom.position,
		gazeThru.position
	)
	gaze.geometry.applyMatrix( head.matrix )
	gaze.visible = true//false
	gaze.name = 'gaze'
	this.gaze = gaze
	head.add( gaze )


	//  Name label.

	canvas  = document.createElement( 'canvas' )
	canvas.width  = 512
	canvas.height = 64
	context = canvas.getContext( '2d' )
	context.textAlign  = 'center'
	context.font = '54px "Helvetica Neue", Helvetica, Arial'
	context.fillStyle  = 'rgb( 255, 255, 255 )'
	context.shadowColor   = 'black'
	context.shadowOffsetX = 0
	context.shadowOffsetY = 2
	context.shadowBlur    = 8
	context.fillText( this.name, canvas.width / 2, 48 )
	texture = new THREE.Texture( canvas )
	texture.needsUpdate = true
	label = new THREE.Mesh( 

		new THREE.PlaneGeometry( canvas.width / 128, canvas.height / 128 ),
		new THREE.MeshBasicMaterial({ map: texture, transparent: true })
	)
	label.name = 'label'
	label.position.set( 0, height - 0.5, 0 )
	this.label = label
	avatar.add( label )
}
Player.prototype.destroy = function(){

	var i


	//  Break down avatar.
	//  Does this remove and destroy all its children?!

	scene.remove( this.avatar )


	//  Remove self from players.findById[]

	players.findById[ this.id ] = undefined


	//  Pop from players Array.

	for( i = players.length; i > -1; i -- ){

		if( players[ i ] === this ){

			players.splice( i, 1 )
			break
		}
	}
}








    /////////////////////
   //                 //
  //   SELF Player   //
 //                 //
/////////////////////


Player.prototype.positionCameraToAvatar = function(){

	var eyeLevel = o.self.head.position.y

	camera.position.set(

		o.self.avatar.position.x,
		o.self.avatar.position.y + eyeLevel,//  Should equal 0 + eyeLevel.
		o.self.avatar.position.z
	)
	camera.updateMatrixWorld()
}
Player.prototype.positionAvatarToCamera = function(){

	var eyeLevel = o.self.head.position.y

	o.self.avatar.position.set(

		camera.position.x,
		camera.position.y - eyeLevel,//  Should equal 0.
		camera.position.z
	)
	o.self.avatar.updateMatrixWorld()
}
Player.prototype.positionSet = function( a, b, c ){

	var x, y, z

	if( a instanceof THREE.Vector3 ){

		x = a.x
		y = a.y
		z = a.z
	}
	else {

		x = a
		y = b
		z = c
	}
	o.self.avatar.position.set( x, y, z )
	o.self.avatar.updateMatrixWorld()
	this.positionCameraToAvatar()
}








//  Have we been hit by eye lasers? (The server will tell us.)
//  If yes, we can check to see who we’re hitting.
//  Or just send that info to the server?!?

Player.prototype.checkForLasers = function(){
	
	var
	raycaster,
	intersects,
	gazeFromWorld,
	gazeThruWorld,
	gazeDirection,
	objectsToCheck = [],
	player = this

	if( this.isReceivingLaser || true ){

		raycaster      = new THREE.Raycaster()
		//  NO:  objectsToCheck.push( emitter )
		//  YES: objectsToCheck.push( lightBulb )
		players.forEach( function( player ){ 

			if( player.isSelf !== true ) objectsToCheck.push( player.head )
		})
		gazeFromWorld  = player.gazeFrom.getWorldPosition()
		gazeThruWorld  = player.gazeThru.getWorldPosition()
		gazeDirection  = gazeThruWorld.sub( gazeFromWorld )
		raycaster.set( gazeFromWorld, gazeDirection.normalize() )
		intersects     = raycaster.intersectObjects( objectsToCheck )


		//if( objectsToCheck.length ) console.log( 'objectsToCheck', objectsToCheck[0].name )
		if( intersects.length ) console.log( 'intersects', intersects )

		intersects.forEach( function( intersect ){

			console.log( 'hit!!!!', intersect )
			// #####  need to send message via server that they’ve been hit!
			intersect.object.material.color = player.color
			intersect.object.material.needsUpdate = true
			intersect.object.gazingAt = true
		})
	}
}




Player.prototype.checkForLasers2 = function(){


	//  If our “receiving laser beam” status has changed...

	if( o.self.isReceivingLaser !== o.self.wasReceivingLaser ){
		

		//  If we WERE receiving a laser beam,
		//  but are NO LONGER receiving a laser beam
		//  it means we are no longer capable of 
		//  passing the laser beam on to anyone else.

		if( o.self.isReceivingLaser === false ){


			//  Tell each player they are not receiving
			//  a laser beam from us.

			players.forEach( function( player ){

				player.wasReceivingLaserFromMe = false
				player.isReceivingLaserFromMe  = false
				o.socket.emit( '????? tell them no laser from myIdString')
			})
		}
		o.self.wasReceivingLaser = o.self.isReceivingLaser
	}

	
	//  If we are currently receiving a laser beam...

	if( o.self.isReceivingLaser === true ){

		
		//  We need to check if we’re lasering anyone else...


		//  might not need forEach... might need to populate an Array for objectsToCheck...
		players.forEach( function( player ){

			// are we intersecting with this person?????
		})
		//  if intersecting then o.socket.emit( '????? LASERING YOU!')
		//  if WAS intersecting but no longer then need to emit('no laser for you')
	}
}






//  Let’s get out variables, shall we?
//  Player’s body position: X, Y, Z
//  Player’s gaze position: A, B, C (was alpha beta gamma when trying this with rotation.)
//  vr.moar.io/roomname#x=0,y=1,z=2,a=0,b=1,c=2

/*
function getBodyPositionGazeRotation(){

	var
	avatarPosition   = players.self.avatar.position,
	gazeThruPosition = players.self.gazeThru.getWorldPosition()

	return {

		x: avatarPosition.x,
		y: avatarPosition.y,
		z: avatarPosition.z,
		a: gazeThruPosition.x,
		b: gazeThruPosition.y,
		c: gazeThruPosition.z
	}
}*/
/*
Player.prototype.setBodyPositionGazeRotation = function( props ){

	var 
	player = players.self,
	vector = new THREE.Vector3( props.a, props.b, props.c ),
	gazeFromWorld,
	gazeThruWorld


	//  Let’s put you in your place! LOOP DE LOOP!

	player.avatar.position.set( props.x, props.y, props.z )
	player.avatar.updateMatrixWorld()
	player.head.lookAt( player.avatar.worldToLocal( vector ))
	player.head.updateMatrixWorld()
	

	//  But seeing is believing. Move that camera!
	
	gazeFromWorld = player.gazeFrom.getWorldPosition()
	gazeThruWorld = player.gazeThru.getWorldPosition()
	console.log('gazeThruWorld',gazeThruWorld)
	console.log('cameraGaze BEFORE',cameraGaze.getWorldPosition() )
	window.camera.position.set(

		gazeFromWorld.x,
		gazeFromWorld.y,
		gazeFromWorld.z
	)
	camera.updateMatrixWorld()
	window.camera.lookAt( gazeThruWorld )
	window.cameraGaze.updateMatrixWorld()
	window.controls.resetSensor()
	console.log('cameraGaze AFTER',cameraGaze.getWorldPosition() )


	//  Need to echo this back to everyone else.

	sendBodyPosition()
	sendGazeRotation()
}
*/









