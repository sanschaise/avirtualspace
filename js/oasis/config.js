

/*


	IMPORTANT !

	This object must be loaded into the global scope BEFORE
	the webver-manager is loaded!


*/





WebVRConfig = {


	// Forces availability of VR mode.
	FORCE_ENABLE_VR: true, // Default: false.

	// Complementary filter coefficient. 0 for accelerometer, 1 for gyro.
	//K_FILTER: 0.98, // Default: 0.98.

	// How far into the future to predict during fast motion.
	//PREDICTION_TIME_S: 0.050, // Default: 0.050 (in seconds).

	// Flag to disable touch panner. In case you have your own touch controls
	//TOUCH_PANNER_DISABLED: true, // Default: false.

	// Forces distortion in VR mode.
	//FORCE_DISTORTION: true, // Default: false.

	// Override the distortion background color.
	//DISTORTION_BGCOLOR: {x: 1, y: 0, z: 0, w: 1}, // Default: (0,0,0,1).



////////////////////////
/*

Ok buddy. If this isn’t set then we get the nice black "binoc" edges
but ZERO stereoscopics!
If it IS set to true then we lose that black mask,
but stero works as expected. WTF?!?!?!?!?!?


*/


	// Prevent distortion from happening.
	PREVENT_DISTORTION: true// Default: false.
}