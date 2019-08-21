



var worlds = []

worlds.setup = function(){

	if( worlds.selected ) worlds.selected.setup()
}
worlds.update = function(){

	if( worlds.selected ) worlds.selected.update()
}




function World( name ){

	this.name = name
	worlds.push( this )
	worlds.selected = this
}
World.prototype.setup    = function(){}
World.prototype.update   = function(){}
World.prototype.teardown = function(){}




//  We can pass XYZ (avatar position)
//  and ABC (gaze position) through URLs
//  so it makes sense we should be able 
//  to validate those too, right?
//  This (very) dumb validator can easily
//  be augmented by your World’s instance!

World.prototype.validatePosition = function( obj ){

	var valid = {}


	//  First off, for this to work we need XYZ to all be numbers.

	if( isNumeric( obj.x ) && isNumeric( obj.y ) && isNumeric( obj.z )){

		valid.position = true
		valid.x = obj.x
		valid.y = obj.y
		valid.z = obj.z


		//  Secondly, for the gaze position to work those need to be 
		//  valid too. But if not, we just skip the gaze.

		if( isNumeric( obj.a ) && isNumeric( obj.b ) && isNumeric( obj.c )){

			valid.gaze = true
			valid.a = obj.a
			valid.b = obj.b
			valid.c = obj.c
		}
	}
	return valid
}










