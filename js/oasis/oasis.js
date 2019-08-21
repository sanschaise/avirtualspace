



    ///////////////
   //           //
  //   OASIS   //
 //           //
///////////////


var o = {

	MAJOR:     2016.0308,
	MINOR:     1159,
	verbosity: 0.5,
	paused:    false
}




o.setup = function(){


	//  Oddly, the first thing we have to do is setup THREE.js
	//  because this will also in turn setup the VR Manager
	//  which we need to determine current or intended VR mode...

	o.setupThree()
	o.setupStats()
	o.setupKeyCommands()
	

	//  You know what’s silly? The VR Manager is going to wait
	//  one thread loop to actually figure out what VR mode we’re in
	//  so we need to also wait some loops to use that information.

	setTimeout( function(){ o.showMarquee( 'Joining...' ), 50 })


	//  Now’s time to connect to the server to receive a global 
	//  timestamp, hopefully enter a world, and setup our ping 
	//  system for relaying updates for player avatar positions, 
	//  gaze positions, and so on.

	o.setupComms()
}




    ///////////////
   //           //
  //   Three   //
 //           //
///////////////


o.setupThree = function(){
	
	window.clock = new THREE.Clock()
	window.container = document.getElementById( 'three' )

	var	
	angle  = 75,
	width  = container.offsetWidth  || window.innerWidth,
	height = container.offsetHeight || window.innerHeight,
	aspect = width / height,
	near   = 0.1,
	far    = 10000


	//  Fire up the WebGL renderer.

	window.renderer = new THREE.WebGLRenderer({ antialias: true })
	renderer.setPixelRatio( window.devicePixelRatio )
	renderer.shadowMap.enabled  = true
	renderer.shadowMap.type     = THREE.PCFSoftShadowMap
	renderer.shadowMap.cullFace = THREE.CullFaceBack
	renderer.setClearColor( 0x000000 )
	container.appendChild( renderer.domElement )


	//  Apply VR stereo rendering to renderer.
	
	window.effect = new THREE.VREffect( renderer )
	effect.setSize( width, height )


	//  Create a VR manager helper to enter and exit VR mode.

	window.manager = new WebVRManager( renderer, effect, { hideButton: false })
	

	//  Create the camera and attach controls to it.

	window.camera   = new THREE.PerspectiveCamera( angle, aspect, near, far )
	camera.name     = 'camera'
	camera.position.set( 0, 1, 0 )
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ))
	window.controls = new THREE.VRControls( camera )
	controls.name   = 'controls'
	controls.resetSensor()


	//  Create the scene tree to attach objects to.

	window.scene = new THREE.Scene()
	scene.name = 'scene'
	scene.add( camera )


	//  Add an object to make determining gaze-direction super easy.

	window.cameraGaze = new THREE.Object3D()
	cameraGaze.name = 'gaze'
	cameraGaze.position.set( 0, 0.1, -60 )
	camera.add( cameraGaze )
}
function render(){

	manager.render( scene, camera )
}
function update( timeStamp ){

	var timeDelta = timeStamp || clock.getDelta()

	if( window.stats    ) stats.update()
	if( window.controls ) controls.update()
	if( window.worlds   ) worlds.update()
	if( window.players  ) players.update()
	if( window.portals  ) portals.update()
	if( window.sand     ) sand.sendUpdateToShaders()

	render()
	requestAnimationFrame( update )
}
o.setupStats = function(){


	//  Add a performance monitoring bug
	//  (“bug” in the video sense, not the programming sense!)
	//  so we can see how speedy (or sluggish) our render is.
	//  The .isVisible property is a convenience measure so other
	//  cody bits can check without having to look at styles.

	window.stats    = new Stats()
	stats.isVisible = false
	stats.toggle    = function(){

		var 
		element = document.getElementById( 'stats' ),
		showing = element.classList.contains( 'show' )

		if( !showing ){

			element.classList.add( 'show' )
			stats.isVisible = true
		}
		else {

			element.classList.remove( 'show' )
			stats.isVisible = false
		}
	}
	document.body.appendChild( stats.domElement )
}




    /////////////////////
   //                 //
  //   DOM General   //
 //                 //
/////////////////////


o.setupKeyCommands = function(){

	window.addEventListener( 'keypress', function( e ){

		var 
		keyCode = e.keycode ? e.keycode : e.which
		keyChar = String.fromCharCode( keyCode ).toUpperCase()

		if( keyChar === 'F' ) stats.toggle()

	}, false )
}


//  Our marquee DIV is a super simple way to present text
//  messages to our user. It has an opaque black background
//  so it performs double-duty: fading in and out our world
//  as we enter or leave it.

o.showMarquee = function( text ){

	var 
	el = document.getElementById( 'marquee' ),
	left, right

	if( text === undefined ) text = ''
	while( el.firstChild ) el.firstChild.remove()
	if( text !== '' ){

		left = document.createElement( 'div' )
		left.innerText = text
		el.appendChild( left )
		right = document.createElement( 'div' )
		right.innerText = text
		el.appendChild( right )
	}
	else el.innerText = text
	el.classList.remove( 'hide' )
}
o.hideMarquee = function(){

	document.getElementById( 'marquee' ).classList.add( 'hide' )
}








document.addEventListener( 'DOMContentLoaded', o.setup )



