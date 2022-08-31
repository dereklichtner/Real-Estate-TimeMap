// jshint esversion: 10

import { Control } from "ol/control";
import playButtonSvg from "url:./images/play-outline.svg";
import nextButtonSvg from "url:./images/play-skip-forward-outline.svg";
import prevButtonSvg from "url:./images/play-skip-back-outline.svg";
import pauseButtonSvg from "url:./images/pause-outline.svg";
import noUiSlider from "nouislider";

class PlayControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(layer, opt_options) {
    const options = opt_options || {};

    const button = document.createElement("button");
    button.className = "play-button";
    const img = document.createElement("img");
    img.className = "play-button-img";
    img.src = playButtonSvg;
    button.appendChild(img);
    const element = document.createElement("div");
    element.className = "play-button-container ol-unselectable ol-control";
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    this.img = img;

    button.addEventListener("click", this.playPause.bind(this, layer));
  }

  playPause(layer) {
    if (!layer.animation.playState) {
      layer.playAnimation();
    } else {
      layer.pauseAnimation();
    }
  }
}

class NextFrameControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(layer, opt_options) {
    const options = opt_options || {};

    const button = document.createElement("button");
    const img = document.createElement("img");
    img.src = nextButtonSvg;
    button.appendChild(img);
    const element = document.createElement("div");
    element.className = "next-frame-button ol-unselectable ol-control";
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    button.addEventListener("click", this.nextFrame.bind(this, layer));
  }

  nextFrame(layer) {
    layer.pauseAnimation();
    layer.goToFrame(layer.animation.frame + 1);
    layer.animation.slider.updateSliderValue(layer.animation.frame);
  }
}

class PrevFrameControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(layer, opt_options) {
    const options = opt_options || {};

    const button = document.createElement("button");
    const img = document.createElement("img");
    img.src = prevButtonSvg;
    button.appendChild(img);
    const element = document.createElement("div");
    element.className = "prev-frame-button ol-unselectable ol-control";
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    button.addEventListener("click", this.prevFrame.bind(this, layer));
  }

  prevFrame(layer) {
    layer.pauseAnimation();
    layer.goToFrame(layer.animation.frame - 1);
    layer.animation.slider.updateSliderValue(layer.animation.frame);
  }
}

class SliderControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(layer, sliderValueArray, opt_options) {
    const options = opt_options || {};

    const sliderContainer = document.createElement("div");
    const sliderContainerInner = document.createElement("div");
    const slider = document.createElement("div");
    const valuesForSlider = sliderValueArray.map((item) => parseInt(item));
    const yearDisplayText = document.getElementById("year-display-text");

    var format = {
      to: function (value) {
        return valuesForSlider[Math.round(value)];
      },
      from: function (value) {
        return valuesForSlider.indexOf(Number(value));
      },
    };

    noUiSlider.create(slider, {
      start: [0],
      range: { min: 0, max: valuesForSlider.length - 1 },
      step: 1,
      tooltips: false,
      format: format,
      pips: { mode: "steps", format: format, filter: null, density: 4 },
    });

    const element = document.createElement("div");
    sliderContainer.appendChild(sliderContainerInner);
    sliderContainerInner.appendChild(slider);
    element.appendChild(sliderContainer);
    element.classList.add("slider-element", "ol-control", "ol-unselectable");
    slider.classList.add("slider-styled");
    sliderContainer.classList.add("slider-container-outer");
    sliderContainerInner.classList.add("slider-container-inner");

    super({
      element: element,
      target: options.target,
    });

    this.yearDisplayText = yearDisplayText;
    this.slider = slider;
    this.valuesForSlider = valuesForSlider;

    // Handle for updating timeline slider
    slider.noUiSlider.on("update", this.handleSliderChange.bind(this, layer));

    // Dynamically adjust timeline label spacing based on window size
    this.setLabelSpacing(this.slider);
    window.onresize = this.setLabelSpacing.bind(this, this.slider);
  }

  setLabelSpacing(slider) {
  // Dynamically sets timeline label spacing based on window size
  // Handles responsive label spacing in js, not with media tags in css, because noUiSlider pip marks are not children of axis
    function filterPipsMed(value, type) {
      if (!(value % 2)) {
        return 2;
      } else {
        return 0;
      }
    }

    function filterPipsSml(value, type) {
      if (!(value % 4)) {
        return 2;
      } else {
        return 0;
      }
    }

    function filterPipsLrg(value, type) {
      return 2;
    }

    if (window.innerWidth < 700) {
      slider.noUiSlider.updateOptions({
        pips: {
          ...slider.noUiSlider.options.pips,
          filter: filterPipsSml,
        },
      });
    } else if (window.innerWidth < 1400) {
      slider.noUiSlider.updateOptions({
        pips: {
          ...slider.noUiSlider.options.pips,
          filter: filterPipsMed,
        },
      });
    } else {
      slider.noUiSlider.updateOptions({
        pips: {
          ...slider.noUiSlider.options.pips,
          filter: filterPipsLrg,
        },
      });
    }
  }

  handleSliderChange(layer) {
    // Changes animation frame when user manually adjusts slider
    const sliderVal = this.slider.noUiSlider.get();
    const newFrame = this.valuesForSlider.indexOf(sliderVal);
    layer.goToFrame(newFrame);

    if (this.yearDisplayText) {
      this.yearDisplayText.innerText = sliderVal;
    }
  }

  updateSliderValue(newValue) {
    // Updates slider value during animation or change via button controls
    this.slider.noUiSlider.set([this.valuesForSlider[newValue]]);
  }
}

export {
  PlayControl,
  NextFrameControl,
  PrevFrameControl,
  SliderControl,
  playButtonSvg,
  pauseButtonSvg,
};
