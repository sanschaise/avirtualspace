



o.setupComms = function(){

	var hueValue, animal


	//  Let’s hook up Socket.IO.

	o.socket = io()


	//  And now let’s knock on the door to the Metaverse.

	if( window.sessionStorage !== undefined ){

		hueValue = sessionStorage.getItem( 'hueValue' )
		animal   = sessionStorage.getItem( 'animal' )
	}
	o.socket.emit( 'knock knock', {

		hueValue: hueValue,
		animal:   animal
	})
	

	//  We’ve been welcomed to the Metaverse.
	//  There’s some good Player() data waiting for us...

	o.socket.on( 'welcome to metaverse', function( data ){

		var el

		data.isSelf = true
		o.self = new Player( data )


		//  We need to sync our clocks so that animation across multiple
		//  devices happens at roughly the same time. Sure, they’ll be lag
		//  and this is far from perfect -- but it’s close enough.

		o.serverTimeSync = data.serverTimeSync
		o.clientTimeSync = Date.now()
		o.timeSyncDelta  = o.clientTimeSync - o.serverTimeSync


		//  Update our UI to reflect our identity.

		el = document.getElementById( 'self-identifier' )
		el.style.backgroundColor = 'hsl('+ o.self.hueValue +',100%,40%)'
		el.innerText = o.self.name


		//  And now that we’re connected to the Metaverse
		//  it’s time to connected to a specific World instance.

		o.socket.emit( 'join world instance', worlds.selected.name +'-'+ o.getInstanceFromUrl() )
	})


	//  Is this world full? Something wrong?
	//  If so then display error and halt.

	o.socket.on( 'world instance is full', function( index ){

		o.showMarquee( 'Aw, snap! That world instance is full.' )
	})


	//  Everything’s all good. We knocked, and the server said come in.

	o.socket.on( 'welcome to world instance', function( data ){

		var position


		//  Might as well build our world.

		worlds.setup()
		

		//  Now’s time to create our own avatar.
		//  We shoud pass our desired position.
		//  Name, hue, etc will be picked up from the global Oasis scope.
		//  $$ VALIDATION OF REQUESTED POSITION COORDS SHOULD HAPPEN IN WORLD!

		position = o.getNearRequestedPosition( o.getAvatarAndGazePositionFromUrl() )
		if( position.isAvatarPositionValid )
			o.self.avatar.position.set( position.x, position.y, position.z )
		if( position.isGazePositionValid ){

			// this should be a re-usable routine that prioritizes the camera lookAt
		}
		o.self.positionCameraToAvatar()
		o.sendAvatarPosition()


		//  Now we can start the THREE render loop
		//  which is called update()
		//  and can remove the marquee opaque curtain.

		update()
		o.hideMarquee()
	})


	//  Right now we do not distinguish between when a player first enters a
	//  world instance, and when a player was already there upon our own entry.

	o.socket.on( 'a not self player is present in this world instance', function( data ){

		var player

		if( players.findById[ data.id ] === undefined ){

			player = new Player( data )			
			console.log( player.name +' is present in our world instance -- this is news to us.' )
		}
		else {

			player = players.findById[ data.id ]
			console.log( player.name +' is present in our world instance -- and we knew that already.' )
		}
		o.sendAvatarPosition()
		o.sendGazePosition()
	})


	//  But an exit is an exit so:

	o.socket.on( 'a not self player has exited this world instance', function( id ){

		var player = players.findById[ id ]

		if( player !== undefined ){

			//$$  THIS SHOULD ACTUALLY REMOVE THE PLAYER!!
			//    NOT JUST MAKE THEM INVISIBLE!!
			//players.findById[ id ].avatar.visible = false

			console.log( players.findById[ id ].name +' has exited our world instance.' )
			players.findById[ id ].destroy()
		}
	})


	//  Update player’s avatar position.

	o.socket.on( 'update player avatar position', function( id, v ){

		var 
		player = players.findById[ id ],
		vector = new THREE.Vector3( v[0], v[1], v[2] )

		player.avatar.position.set( vector.x, vector.y, vector.z )
		//console.log( 'Updated avatar position for '+ player.name )
	})


	//  Update player’s gaze position.
	//  Note that this is not the gaze ROTATION, because we are sending
	//  an XYZ coordinate which is the gaze’s focus.
	//  Far easier. No seriously. No it’s ok, I’ll wait while you 
	//  refactor this here, the server side code, then pass the quaternions
	//  and then try to draw the line of sight ray for intersections...
	//  Yea. EASIER this way? Right?

	o.socket.on( 'update player gaze position', function( id, v ){

		var 
		player = players.findById[ id ],
		vector = new THREE.Vector3( v[0], v[1], v[2] )

		if( player !== undefined ) player.head.lookAt( player.avatar.worldToLocal( vector ))
		//console.log( 'Updated gaze position for '+ player.name )
	})


	//  Make debugging easier? You got it!

	o.socket.on( 'ping', function( message ){

		console.log( '>> ', message )
	})





	//  WALK AROUND.
	//  Quickly adds touch or spacebar listeners to make walking
	//  forward possible. Really no thought or fucks given as to
	//  preventing defaults or bubbling. 

	window.addEventListener( 'touchstart', function( event ){

		if( o.self ) o.self.isWalking = true
	})
	window.addEventListener( 'touchend', function( event ){

		if( o.self ) o.self.isWalking = false
	})
	window.addEventListener( 'keydown', function( event ){

		var 
		n = event.charCode || event.keyCode,
		c = String.fromCharCode( n ).toUpperCase()

		if( o.self && c === ' ' ) o.self.isWalking = true
	})
	window.addEventListener( 'keyup', function( event ){

		var 
		n = event.charCode || event.keyCode,
		c = String.fromCharCode( n ).toUpperCase()

		if( o.self && c === ' ' ) o.self.isWalking = false
	})
	window.addEventListener( 'beforeunload', function(){
  	
  		o.socket.emit( 'disconnect' )
  	})
}




//  PLAYER AVATAR POSITION.
//  Avatar positions are already in World space coordinates
//  so there’s no need to convert from Local to World space.
//  Isn’t that nice?

o.sendAvatarPosition = function(){

	var avatarWorld = o.self.avatar.position.clone()

	o.socket.emit( 'update player avatar position', o.self.id, [ avatarWorld.x, avatarWorld.y, avatarWorld.z ])
}
o.sendAvatarPositionVolatile = function(){

	var avatarWorld = o.self.avatar.position.clone()

	o.socket.emit( 'update player avatar position volatile', o.self.id, [ avatarWorld.x, avatarWorld.y, avatarWorld.z ])
}
o.sendGazePosition = function(){

	var cameraGazeWorld = cameraGaze.getWorldPosition()

	o.socket.emit( 'update player gaze position', o.self.id, [ 

		cameraGazeWorld.x, 
		cameraGazeWorld.y, 
		cameraGazeWorld.z
	])
}
o.sendGazePositionVolatile = function(){

	var cameraGazeWorld = cameraGaze.getWorldPosition()

	o.socket.emit( 'update player gaze position volatile', o.self.id, [ 

		cameraGazeWorld.x, 
		cameraGazeWorld.y, 
		cameraGazeWorld.z
	])
}








//  More than one variable can be passed through the search 
//  parameter. For example, the WebVR Manager uses “?start_mode=”
//  to see if we should be starting up already in stereoscopic
//  mode. For this reason we need to keep an eye out for a proper
//  “instance” variable, rather than how we were operating previously.

o.getInstanceFromUrl = function(){

	var 
	query = document.location.search.substr( 1 ),
	temps = query.split( '&' ),
	props = {}

	temps.forEach( function( temp ){

		var pair = temp.split( '=' )
		props[ pair[ 0 ]] = pair[ 1 ]
	})
	if( props.instance === undefined ) props.instance = ''
	return props.instance.toLowerCase()
}


//  URLs may contain a request to drop this Player’s avatar
//  into a specific XYZ location. This request may or may 
//  not be honored -- it’s up to the World’s code. Similarly 
//  we can pass a requested gaze position as ABC.

o.getAvatarAndGazePositionFromUrl = function( location ){

	if( location === undefined ) location = document.location

	var 
	query = location.hash.substr( 1 ),
	temps = query.split( ',' ),
	props = {}

	temps.forEach( function( temp ){

		var pair = temp.split( '=' )
		props[ pair[ 0 ]] = isNumeric( pair[ 1 ]) ? +pair[ 1 ] : undefined
	})
	if( isNumeric( props.x ) && isNumeric( props.y ) && isNumeric( props.z )) props.isAvatarPositionValid = true
	else props.isAvatarPositionValid = false
	if( isNumeric( props.a ) && isNumeric( props.b ) && isNumeric( props.c )) props.isGazePositionValid = true
	else props.isGazePositionValid = false
	return {

		isAvatarPositionValid: props.isAvatarPositionValid,
		x: props.x,
		y: props.y,
		z: props.z,

		isGazePositionValid: props.isGazePositionValid,
		a: props.a,
		b: props.b,
		c: props.c,
	}
}


//  Let’s modify the current URL to contain our Player’s
//  avatar position and gaze position. Makes for easy bookmarking
//  and link sharing!

o.setAvatarAndGazePositionsToUrl = function(){

	var 
	props = getBodyPositionGazeRotation(),
	hash  = '#'+
		'x='+ props.x +','+
		'y='+ props.y +','+
		'z='+ props.z +','+
		'a='+ props.a +','+
		'b='+ props.b +','+
		'c='+ props.c
	
	document.location.hash = hash
	return hash
}




//  We have bookmarked or passed a location through the URL
//  but imagine if we mass mailed that location and everyone
//  tried to appear there at the exact same time. It would be
//  chaos! So instead we’re going to honor the Gaze position
//  but use the requested Avatar position as an origin that
//  we find orbit positions around.

o.getNearRequestedPosition = function( props ){

	var 
	angle  = o.self.hueValue.degreesToRadians() || 0,
	radius = 6

	if( props.isAvatarPositionValid !== true ){

		props.x = 0
		props.y = 0
		props.z = 0
	}
	props.x += Math.cos( angle ) * radius
	props.y  = 0
	props.z += Math.sin( angle ) * radius
	props.isAvatarPositionValid = true
	return props
}





