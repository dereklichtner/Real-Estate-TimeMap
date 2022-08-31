// jshint esversion: 9

import WebGLPointsLayer from "ol/layer/WebGLPoints";
import { PlayControl, playButtonSvg, pauseButtonSvg } from "./animateControls";

class AnimatedWebGLPointsLayer extends WebGLPointsLayer {
  /**
   * @param {Object} [opt_options] Layer options.
   */

  constructor(opt_options) {
    const options = opt_options || {};
    const animatedStyle = {
      variables: { filterValue: "" }, // doesn't account for if style already has variables...! would unintentionally replace user-declared styleVars
      filter: ["==", ["get", options.animatedField], ["var", "filterValue"]], // to allow on-the-fly picking of animated field, would need to add null filter for all fields at layer creation...
      ...options.style,
    };

    super({
      ...options,
      style: animatedStyle,
    });

    this.animation = {
      // use Object.assign instead?
      elapsedTime: 0,
      pausedPoint: 0,
      frame: 0,
      rate: 4, // default rate 4, if not specified when calling playAnimation
      playState: false,
      initialized: false,
      startTime: null,
      animatedField: options.animatedField,
      startFrame: 0,
      //totalFrames: 27, // NEED TO CALC THIS WITHIN CONSTRUCTOR, OR BE PASSED IT (to save loading time)
    };

    this.playAnimation = this.playAnimation.bind(this);
    this.pauseAnimation = this.pauseAnimation.bind(this);
    this.animateFrame = this.animateFrame.bind(this);
    this.goToFrame = this.goToFrame.bind(this);
    this.initAnimation = this.initAnimation.bind(this);

  }

  initAnimation(opt_options) {
    // Change animation rate if specified by user
    const options = opt_options || {};
    if (options.rate) {
      this.animation.rate = options.rate;
    }
    if (options.startFrame) {
      this.animation.startFrame = options.startFrame;
    }
    
    this.animation.totalFrames = this.animation.animatedFieldUnique.length; // this currently requires specifying in app.js; how to foolproof?

    // Get slider control for animation, if present
    this.animation.slider =
      this.get("map")
        .getControls()
        .array_.filter((control) =>
          control.element.className.includes("slider-element")
        )[0] || null;

    // Get popup overlay for animation, if present
    this.animation.popup =
      this.get("map")
        .getOverlays()
        .array_.filter((overlay) => "popupContainer" in overlay)[0] || null;

    // Get play/pause button, if present
    this.animation.playControl = this.get("map").controls.array_.filter(
      (item) => item.constructor.name === PlayControl.name
    )[0];

    // Set animation start frame (default 0)
    this.goToFrame(this.animation.startFrame);
    this.animation.initialized = true;


  }

  playAnimation(opt_options) {
    // Change animation rate if specified by user
    const options = opt_options || {};
    if (options.rate) {
      this.animation.rate = options.rate;
    }

    // On first play, set some misc. variables and associate animation with controls and overlays, if present
    // move to separate function firstPlay();
    if (!this.animation.initialized) {
      this.initAnimation();
      this.animation.initialized = true;
    }

    // If resuming from paused animation
    if (!this.animation.playState) {
      this.animation.pausedPoint = this.animation.frame / this.animation.rate;
      this.animation.startTime = Date.now();
      this.animation.elapsedTime = 0;
      this.animation.playState = true;
      if (this.animation.playControl) {
        this.animation.playControl.img.src = pauseButtonSvg;
      }
    }

    // Restart animation from beginning if play started from final frame
    if (this.animation.frame == this.animation.totalFrames - 1) {
      this.animation = {
        ...this.animation,
        elapsedTime: 0,
        pausedPoint: 0,
        frame: 0,
      };
      this.goToFrame(this.startFrame);
    }

    // Animate if playState is true
    if (this.animation.playState) this.animateFrame();
  }

  animateFrame() {
    if (this.animation.playState) {
      if (this.animation.frame == this.animation.totalFrames - 1) {
        //this.animation.over = true;
        this.pauseAnimation();
        //this.animation.playState = false;
        return;
      } else {
        this.animation.elapsedTime =
          this.animation.pausedPoint +
          (Date.now() - this.animation.startTime) / 1000;
        const calcFrame = this.animation.elapsedTime * this.animation.rate;
        const nextFrame = Math.floor(calcFrame);
        if (nextFrame > this.animation.frame) {
          this.goToFrame(nextFrame);
          // If slider-control has been added to map, update slider when animating
          if (this.animation.slider) {
            this.animation.slider.updateSliderValue(this.animation.frame);
          }
        }
        this.animation.animationID = window.requestAnimationFrame(
          this.animateFrame
        );
      }
    }
  }

  goToFrame(newFrame) {
    // console.log('newFrame: ' + newFrame);
    // console.log('this.animation.totalFrames: ' + this.animation.totalFrames);

    const newFrameInt = parseInt(newFrame);

    if (newFrameInt < this.animation.totalFrames && newFrameInt >= 0) {
      this.animation.frame = newFrameInt;
      this.animation.activeFilter =
        this.animation.animatedFieldUnique[this.animation.frame];
      this.updateStyleVariables({
        filterValue: this.animation.activeFilter,
      });
      this.changed();

      // If popup overlay has been added to map, update popup when animating
      if (this.animation.popup) {
        this.animation.popup.updatePopupContent();
      }
    }
  }

  pauseAnimation() {
    //this.animation.pausedPoint = this.animation.frame / this.animation.rate;
    //this.animation.elapsedTime = 0;
    this.animation.playState = false;
    window.cancelAnimationFrame(this.animation.animationID);

    // If play-pause button control overlay has been added to map, toggle icon on play/pause
    if (this.animation.playControl) {
      // TODO: can toggle play/pause img src w/ css class?
      this.animation.playControl.img.src = playButtonSvg;
    }
  }
}

export default AnimatedWebGLPointsLayer;
