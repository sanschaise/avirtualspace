



var portals = []

portals.update = function(){

	this.forEach( function( portal ){

		var distance = myPosition.distanceTo( portal.position )
		
		if( distance <= portal.activationRadius ){

			if( portal.isActivated === false &&
				portal.isClutched  === false ){

				portal.onEnter()
			}
		}
		else if( distance >= portal.declutchRadius ) portal.isClutched = false
	})
}




//  Portals teleport a Player from one location to another.

function Portal( position, href, name ){

	var current = document.location
	

	//  Is this an INTERNAL or EXTERNAL portal?
	//  ie. Will it require a page load?

	this.target = document.createElement( 'a' )
	this.target.href = href
	if( current.origin   === this.target.origin &&
		current.pathname === this.target.pathname ){

		this.type = Portal.INTERNAL
	}
	else this.type = Portal.EXTERNAL


	//  Where should it be located? etc.

	this.position    = new THREE.Vector3( position.x, position.y, position.z )
	this.isActivated = false
	this.isClutched  = true
	this.activationRadius = 300
	this.declutchRadius   = 400


	//  Totally fine if this is undefined. 

	this.name = name

	portals.push( this )
}




Portal.prototype.onEnter = function(){
	
	var 
	portal = this,
	destination = this.target.origin + this.target.pathname 

	o.showMarquee( 'Teleporting...' )
	//o.self.isWalking = false
	this.isActivated = true
	// o.self.avatar.position.set( this.position.x, this.position.y, this.position.z )
	// o.self.positionCameraToAvatar()

	if( this.type === Portal.INTERNAL ){
	
		o.sendAvatarPosition()
		setTimeout( function(){

			var targetPosition = o.getAvatarAndGazePositionFromUrl( portal.target )

			portals.forEach( function( portal ){

				portal.isClutched = true
			})
			o.self.positionSet( targetPosition.x, targetPosition.y, targetPosition.z )
			o.sendAvatarPosition()
			o.hideMarquee()
			portal.isActivated = false

		}, 400 )
	}
	else if( this.type === Portal.EXTERNAL ){

		setTimeout( function(){

			document.location.href = destination

		}, 400 )
		o.sendAvatarPosition()
		o.socket.emit( 'disconnect' )
	}
}
Portal.INTERNAL = 'INTERNAL'
Portal.EXTERNAL = 'EXTERNAL'




//window.onhashchange = function(){}








