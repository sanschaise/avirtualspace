



var Modes = {
  UNKNOWN: 0,
  // Not fullscreen, just tracking.
  NORMAL: 1,
  // Magic window immersive mode.
  MAGIC_WINDOW: 2,
  // Full screen split screen VR mode.
  VR: 3,
}




WebVRManager.prototype.setMode_ = function(mode) {
//manager.setMode_ = function(mode) {  
  var oldMode = this.mode;
  if (mode == this.mode) {
    console.error('Not changing modes, already in %s', mode);
    return;
  }
  console.log('Mode change: %s => %s', this.mode, mode);
  this.mode = mode;
  this.button.setMode(mode, this.isVRCompatible);

  // if (this.mode == Modes.VR && Util.isLandscapeMode() && Util.isMobile()) {
  //   // In landscape mode, temporarily show the "put into Cardboard"
  //   // interstitial. Otherwise, do the default thing.
  //   this.rotateInstructions.showTemporarily(3000);
  // } else {
    //this.updateRotateInstructions_();
  // }

  // Also hide the viewer selector.
  this.viewerSelector.hide();

  // Emit an event indicating the mode changed.
  this.emit('modechange', mode, oldMode);

  // Note: This is a nasty hack since we need to communicate to the polyfill
  // that touch panning is disabled, and the only way to do this currently is
  // via WebVRConfig.
  // TODO: Maybe move touch panning to the boilerplate to eliminate the hack.
  
  // If we are in VR mode, always disable touch panning.
  if (this.isTouchPannerEnabled) {
    if (this.mode == Modes.VR) {
      WebVRConfig.TOUCH_PANNER_DISABLED = true;
    } else {
      WebVRConfig.TOUCH_PANNER_DISABLED = false;
    }
  }

  if (this.mode == Modes.VR) {
    // In VR mode, set the HMDVRDevice parameters.
    this.setHMDVRDeviceParams_(this.getViewer());
  }
};





