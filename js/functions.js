function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function initSky(){
	cameraCube = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100 );
	sceneCube = new THREE.Scene();
	var path = "images/sky/";
				var format = '.jpg';
				var urls = [
						path + 'posx' + format, path + 'negx' + format,
						path + 'posy' + format, path + 'negy' + format,
						path + 'posz' + format, path + 'negz' + format
					];

				var reflectionCube = THREE.ImageUtils.loadTextureCube( urls );
				reflectionCube.format = THREE.RGBFormat;

				var refractionCube = new THREE.CubeTexture( reflectionCube.image, THREE.CubeRefractionMapping );
				refractionCube.format = THREE.RGBFormat;

				//var cubeMaterial3 = new THREE.MeshPhongMaterial( { color: 0x000000, specular:0xaa0000, envMap: reflectionCube, combine: THREE.MixOperation, reflectivity: 0.25 } );
				var cubeMaterial3 = new THREE.MeshLambertMaterial( { color: 0xff6600, envMap: reflectionCube, combine: THREE.MixOperation, reflectivity: 0.3 } );
				var cubeMaterial2 = new THREE.MeshLambertMaterial( { color: 0xffee00, envMap: refractionCube, refractionRatio: 0.95 } );
				var cubeMaterial1 = new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: reflectionCube } )

				// Skybox

				var shader = THREE.ShaderLib[ "cube" ];
				shader.uniforms[ "tCube" ].value = reflectionCube;

				var material = new THREE.ShaderMaterial( {

					fragmentShader: shader.fragmentShader,
					vertexShader: shader.vertexShader,
					uniforms: shader.uniforms,
					depthWrite: false,
					side: THREE.BackSide

				} ),

				mesh = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), material );
				sceneCube.add( mesh );
}




// stars


function initLights(){

				//lights 
				var ambient = new THREE.AmbientLight(ambientColor,0.01);
				scene.add(ambient);

				directionalLight = new THREE.DirectionalLight( lightColor, 1.30 );
				directionalLight.position.set( dLightX, dLightY+70 , dLightZ);

				
				directionalLight.castShadow = true;

				//directionalLight.shadowCameraVisible = true;

				directionalLight.shadowCameraNear = 10;
				directionalLight.shadowCameraFar = camera.far;
				directionalLight.shadowCameraFov = 10;
				directionalLight.shadowCameraLeft = -3500;
				directionalLight.shadowCameraRight = 3500;
				directionalLight.shadowCameraTop = 3500;
				directionalLight.shadowCameraBottom = -3500;
				directionalLight.target = camera;

				//directionalLight.shadowBias = 0.00022;
				directionalLight.shadowDarkness = 0.89;

				directionalLight.shadowMapWidth = 2048;
				directionalLight.shadowMapHeight = 2048;

				//directionalLight.shadowMapSize = new THREE.Vector2(1000,1000);
				
				scene.add( directionalLight );


}



function initStars(x,y,z,quantity) {

	geometry = new THREE.SphereGeometry( 5, 5, 1 );


	for ( var i = 0; i < quantity; i ++ ) {

		material = new THREE.MeshLambertMaterial( { wireframe: false,shading:THREE.FlatShading } );
		material.color.setHex( 0xffffff );


		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.x = x + Math.floor( Math.random() * 20 - 10 ) * 100;
		mesh.position.y = y + Math.floor( Math.random() * 20 ) * 20 + 10;
		mesh.position.z = z + Math.floor( Math.random() * 20 - 10 ) * 100;

		var scale = 3;
		mesh.scale.x = scale;
		mesh.scale.y = scale;
		mesh.scale.z = scale;

		mesh.rotation.x = Math.random()*Math.PI;
		mesh.rotation.y = Math.random()*Math.PI;
		mesh.rotation.z = Math.random()*Math.PI;

		 mesh.castShadow = false;
		mesh.receiveShadow = true;

		scene.add( mesh );


		stars.push( mesh );
	 }

}

function animateStars(){

	for (var i = 0; i < stars.length; i++) {
		stars[i].position.x +=  Math.random()-Math.random();
		stars[i].position.y +=  Math.random()-Math.random();
		stars[i].position.z +=  Math.random()-Math.random();
	};

}

function placeVideo(name,source,x,y,z,w,h) {
	

				var divVideos = document.getElementById("videos");

				var htmlString = "<video id='"+name+"' controls loop autoplay style='display:none'> <source src='"+source+"' type='video/mp4'> </video>";

				divVideos.innerHTML += htmlString;
				
				var video = document.getElementById( 'name' );

				//

				var image = document.createElement( 'canvas' );
				//console.log(video.videoHeight); // returns the intrinsic height of the video
				//video.videoWidth;

				h= h;
				w = w;

				image.width = w/1.25;
				image.height = h/1.25;

				imageContext = image.getContext( '2d' );
				imageContext.fillStyle = '#000000';
				imageContext.fillRect( 0, 0, w, h );

				var texture = new THREE.Texture( image );
				
				
				var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
				//material.skinning = true;

				material.side = THREE.DoubleSide;

				var plane = new THREE.PlaneBufferGeometry( w, h, 4, 4 );

				mesh = new THREE.Mesh( plane, material );
				mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.5;
				mesh.position.z = z;
				mesh.position.y = h/3 * mesh.scale.z + y;
				mesh.position.x = x;

				mesh.rotation.y = 4*Math.PI/5;

				scene.add(mesh);

				var returnArray = {context:imageContext, tex: texture, object: mesh};

				return returnArray;
			}


//type

		function placeCaption(string, x,y,z,w,h){
										/////// draw text on canvas /////////

				// create a canvas element
				var canvas1 = document.createElement('canvas');
				var context1 = canvas1.getContext('2d');

				var cw = w*5;
				var ch = h*5;
				context1.canvas.width  = cw;
  				context1.canvas.height = ch;

  				var fontSize = 22;
				var lineHeight = fontSize;
  				var tx = 20;
				var ty = 20;

				
				context1.fillStyle = "rgba(225,225,225,0)";
				context1.fillRect(0,0,context1.canvas.width,context1.canvas.height);
				
				context1.font = "Bold "+fontSize+"px Domaine, Futura";
				//context1.textAlign = 'center';
				context1.fillStyle = "rgba(0,0,255,255)";

			    context1.fillText(string, tx, ty+lineHeight*1);
		


			 //   	var fontSize = 910;
				// var lineHeight = fontSize;
  		// 		var x = context1.canvas.width/2;
				// var y = context1.canvas.height/(fontSize/2);
				
				// context1.font = "Bold "+fontSize+"px HapticBlack, Futura";
				// context1.textAlign = 'center';
				// context1.fillStyle = "rgba(0,0,0,1)";


			    //context1.fillText('24', x, y+lineHeight*1);

			    
				// canvas contents will be used for a texture
				var texture1 = new THREE.Texture(canvas1) 
				texture1.needsUpdate = true;
			      
			    canvasMaterial = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
			    canvasMaterial.transparent = true;

			    var mesh1 = new THREE.Mesh(
			        new THREE.PlaneGeometry(w, h),
			        canvasMaterial
			      );
				mesh1.position.set(x,y,z);
				//mesh1.rotation.x=-Math.PI/10;
				scene.add( mesh1 );

				//return mesh1;
		}

function placeImg(src, x ,y,z,theta,s,shadingStyle, reveiveShadow){

    var w;
    var h;
    THREE.ImageUtils.crossOrigin = '';

    if ( shadingStyle =="lambert") {
		var img = new THREE.MeshLambertMaterial({ //CHANGED to MeshBasicMaterial
			transparent: true, opacity: 1,
	        map:THREE.ImageUtils.loadTexture(src,THREE.UVMapping,function() {  caption.position.y+=img.map.image.height*s*0.55 ;plane.scale.x=img.map.image.width*s; plane.scale.y=img.map.image.height*s; })
	    });
	} else {
		var img = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
			transparent: true, opacity: 1,
	        map:THREE.ImageUtils.loadTexture(src,THREE.UVMapping,function() { caption.position.y+=img.map.image.height*s*0.55 ;plane.scale.x=img.map.image.width*s; plane.scale.y=img.map.image.height*s; })
	    });
	}

    img.map.needsUpdate = true; //ADDED

    

    // plane
    var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1),img);
    plane.overdraw = true;
    
    
	img.side =THREE.DoubleSide;
    scene.add(plane);

    var captionString = src;
    captionString = captionString.split("/");
    captionString = captionString[captionString.length-1];
    var caption = placeText(captionString,0,0,0,0,1000,c_blue,50);
    

    var group = new THREE.Object3D();//create an empty container
	group.add( plane );//add a mesh with geometry to it
	group.add(caption);
	group.position.set(x,y,z);
	group.rotation.y = theta;
	scene.add(group);



    //plane.add(caption);

    plane.castShadow = reveiveShadow;
	plane.receiveShadow = reveiveShadow;

    return group;

    // if (b_lookAtMe){
    // 	img.side =THREE.DoubleSide;
    // 	lookAtMe.push(plane);
    // }

}

function placeTitle(string, x,y,z, color, _fontSize){
										/////// draw text on canvas /////////

				// create a canvas element
				var canvas1 = document.createElement('canvas');
				var context1 = canvas1.getContext('2d');



				var cw = window.innerWidth*1;
				var ch = window.innerHeight*1;
				context1.canvas.width  = cw;
  				context1.canvas.height = ch;

  				var fontSize = _fontSize;
				var lineHeight = fontSize*1.8;
  				var tx = cw/2;
				var ty = ch/7;

				
				context1.fillStyle = "rgba(225,0,225,0)";
				context1.fillRect(0,0,context1.canvas.width,context1.canvas.height);
				
				context1.font = fontSize+"px Domaine, Futura";
				context1.textAlign = 'center';
				context1.fillStyle = color;
				context1.letterSpacing = "20px";

				

				var ctext = string.split("").join(String.fromCharCode(8201));
				var ctext = string.split("").join(String.fromCharCode(8201));
			    //context1.fillText(ctext, tx, ty+lineHeight*1);
				
				wrapText(context1, ctext, tx, 0+fontSize, cw, lineHeight);


		

			    
				// canvas contents will be used for a texture
				var texture1 = new THREE.Texture(canvas1) 
				texture1.needsUpdate = true;
			      
			    canvasMaterial = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
			    canvasMaterial.transparent = true;

			    var mesh1 = new THREE.Mesh(
			        new THREE.PlaneBufferGeometry(cw/7, ch/7),
			        canvasMaterial
			      );
				mesh1.position.set(x,y,z);
				//mesh1.rotation.x=-Math.PI/10;
				scene.add( mesh1 );

				return mesh1;
		}


function placeText(string, x,y,z, theta, _width, color, _fontSize){
										/////// draw text on canvas /////////

				// create a canvas element
				var canvas1 = document.createElement('canvas');
				var context1 = canvas1.getContext('2d');

				var fontSize = _fontSize;
				var lineHeight = fontSize*1.8;

				context1.font = fontSize+"px Domaine, Futura";
				context1.textAlign = 'center';
				context1.fillStyle = color;
				context1.letterSpacing = "20px";

				var ctext = string.split("").join(String.fromCharCode(8201));
				var ctext = string.split("").join(String.fromCharCode(8201));

				var cw = _width;
				//var ch = window.innerHeight*1;
				context1.canvas.width  = cw;

				var ch = ((context1.measureText(ctext).width/(_width/7))*(lineHeight*7));
				//context1.canvas.height = lineHeight;

				//context1.canvas.width  = cw;

				// var ch = calculateTextHeight(context1,string,0,0+lineHeight,cw/7,lineHeight)+lineHeight;
				 console.log(ch);

				context1.canvas.height = ch;

  				
  				var tx = cw/2;
				var ty = 0;

				// var ctext = string.split("").join(String.fromCharCode(8201));
				// var ctext = string.split("").join(String.fromCharCode(8201));
				
				context1.fillStyle = "rgba(225,0,225,0)";
				context1.fillRect(0,0,context1.canvas.width,context1.canvas.height);
				
				context1.font = fontSize+"px Domaine, Futura";
				context1.textAlign = 'center';
				context1.fillStyle = color;
				context1.letterSpacing = "20px";

				

				
			    //context1.fillText(ctext, tx, ty+lineHeight*1);
				
				wrapText(context1, ctext, tx, 0+fontSize, cw, lineHeight);


		

			    
				// canvas contents will be used for a texture
				var texture1 = new THREE.Texture(canvas1) 
				texture1.needsUpdate = true;
			      
			    canvasMaterial = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
			    canvasMaterial.transparent = true;

			    var mesh1 = new THREE.Mesh(
			        new THREE.PlaneBufferGeometry(cw/7, ch/7),
			        canvasMaterial
			      );
				mesh1.position.set(x,y,z);
				mesh1.rotation.y=theta;
				scene.add( mesh1 );

				return mesh1;
		}


		function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          }
          else {
            line = testLine;
          }
        }
        context.fillText(line, x, y);
      }

      function calculateTextHeight( context,text,x,y,maxWidth, lineHeight) {
      	
        var words = text.split(' ');
        var line = '';

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            //context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
            console.log(y);
          }
          else {
            line = testLine;
          }
        }
        return y;
      }


function initNotification(string, color){
										/////// draw text on canvas /////////

				// create a canvas element
				var canvas1 = document.createElement('canvas');
				var context1 = canvas1.getContext('2d');

				var cw = 700;
				var ch = 500;
				context1.canvas.width  = cw;
  				context1.canvas.height = ch;

  				var fontSize = 20;
				var lineHeight = fontSize;
  				var tx = cw/2;
				var ty = 10;

				
				context1.fillStyle = "rgba(225,0,225,0)";
				context1.fillRect(0,0,context1.canvas.width,context1.canvas.height);
				
				context1.font = fontSize+"px Domaine, Futura";
				context1.textAlign = 'center';
				context1.fillStyle = color;
				
				var ctext = string.split("").join(String.fromCharCode(8201));
				var ctext = string.split("").join(String.fromCharCode(8201));
			    context1.fillText(ctext, tx, ty+lineHeight*1);

			    
				// canvas contents will be used for a texture
				var texture1 = new THREE.Texture(canvas1) 
				texture1.needsUpdate = true;
			      
			    canvasMaterial = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
			    canvasMaterial.transparent = true;

			    var mesh1 = new THREE.Mesh(
			        new THREE.PlaneGeometry(cw/7, ch/7),
			        canvasMaterial
			      );
				mesh1.position.set(0,0,0);
				//mesh1.rotation.x=-Math.PI/10;
				scene.add( mesh1 );

				return mesh1;
		}






// initpointer

			function initPointerLock(){
				var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

			if ( havePointerLock ) {

				var element = document.body;

				var pointerlockchange = function ( event ) {

					if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

						controlsEnabled = true;
						controls.enabled = true;
						displayTitle = false;

						blocker.style.display = 'none';

					} else {

						controls.enabled = false;

						//pass time faster
						
						

						blocker.style.display = '-webkit-box';
						blocker.style.display = '-moz-box';
						blocker.style.display = 'box';

						instructions.style.display = '';

						displayTitle = true;

						var titlePostion = myPosition.clone();
						titlePostion.x += cameraDirection.x*-200;
						 titlePostion.y += cameraDirection.y*200;
						titlePostion.z += cameraDirection.z*-200;

						for (var i = 0; i < titles.length; i++) {
							titles[i].position.set(titlePostion.x, titlePostion.y-50, titlePostion.z);
							titles[i].lookAt(myPosition);
							//console.log(i);
						};

						



						// title.position.set(titlePostion.x, titlePostion.y-40, titlePostion.z);
						// title.lookAt(myPosition);
						

					}

				}

				var pointerlockerror = function ( event ) {

					instructions.style.display = '';

				}

				// Hook pointer lock state change events
				document.addEventListener( 'pointerlockchange', pointerlockchange, false );
				document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
				document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

				document.addEventListener( 'pointerlockerror', pointerlockerror, false );
				document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
				document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

				instructions.addEventListener( 'click', function ( event ) {

					instructions.style.display = 'none';

					// Ask the browser to lock the pointer
					element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

					if ( /Firefox/i.test( navigator.userAgent ) ) {

						var fullscreenchange = function ( event ) {

							if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

								document.removeEventListener( 'fullscreenchange', fullscreenchange );
								document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

								element.requestPointerLock();
							}

						}

						document.addEventListener( 'fullscreenchange', fullscreenchange, false );
						document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

						element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

						element.requestFullscreen();

					} else {

						element.requestPointerLock();

					}

				}, false );

			} else {

				instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API, try Google Chrome';

			}
			}

function makeFloor() {
				var bufferGeometry = new THREE.PlaneBufferGeometry(390000, 390000, 4, 4 );
				bufferGeometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

				material = new THREE.MeshLambertMaterial( { color:floorColor, wireframe: false } );

				
				

				floor = new THREE.Mesh( bufferGeometry, material );
				floor.position.y= 0;

				floor.castShadow = true;
				floor.receiveShadow = true;
				scene.add( floor );
				rooms.push(floor)



}


function placeSTL( path  ,_position, theta, color, shadingSide, shadingStyle, b_castShadow, b_receiveShadow, extra) {
	var mesh;
	loader.load( path,  function ( geometry ) {

		// 	texture = THREE.ImageUtils.loadTexture('texture.jpg', {}, function() {
		// 	    renderer.render(scene);
		// });

		var material ;

		if (shadingStyle === "lambert" ){
			material = new THREE.MeshLambertMaterial( {color: color}  );
		} else if ( shadingStyle === "phong" ) {
			material = new THREE.MeshPhongMaterial( {color: color}  );
			} else {
			material = new THREE.MeshBasicMaterial( {color: color}  );
		}
		mesh = new THREE.Mesh( geometry, material );
		// material.color.setRGB(0.92,0.92,0.92 );
		material.side = shadingSide;

		mesh.position.set( _position.x, _position.y, _position.z);
		mesh.rotation.x = -Math.PI/2;
		mesh.rotation.z = theta;
		mesh.scale.set( 0.98, 0.98, 0.98);

		mesh.castShadow = b_castShadow;
		mesh.receiveShadow = b_receiveShadow;


		scene.add( mesh );
		rooms.push( mesh );
		eval(extra);

		// var materials = [];
		// for (var i=0; i<6; i++) {
		//   var img = new Image();
		//   img.src = 'images/sky/'+i + '.jpg';
		//   var tex = new THREE.Texture(img);
		//   img.tex = tex;
		//   img.onload = function() {
		//     this.tex.needsUpdate = true;
		//   };
		//   var mat = new THREE.MeshBasicMaterial({color: 0xffffff, map: tex});
		//   materials.push(mat);
		// }
		
		// mesh.material =  new THREE.MeshFaceMaterial( materials );


		

		//objects.push(mesh);
	

		});

		
	

	

		};



			 function toScreenPosition(point, camera, width, height) {
			        
			        var p = point.clone();
			        var vector = p.project(camera);

			        vector.x = (vector.x + 1) / 2 * width;
			        vector.y = -(vector.y - 1) / 2 * height;

			        return vector;

			    }