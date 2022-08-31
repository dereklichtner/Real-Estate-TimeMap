// jshint esversion: 10

import Overlay from "ol/Overlay";
import { dollarsWhole } from "../util/dollarsFormat";

class Popup extends Overlay {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(layer, opt_options) {
    const options = opt_options || {}; // not sure all opt_options will pass correctly

    // TODO: Fix?: Below won't work if map has different ID name
    const mapContainer = document.getElementById("map-container");

    const popupContainer = document.createElement("div");
    popupContainer.id = "popup";
    popupContainer.classList.add("ol-popup");
    mapContainer.appendChild(popupContainer);

    const popupContent = document.createElement("div");
    popupContent.id = "popup-content";
    popupContainer.appendChild(popupContent);

    const closer = document.createElement("a");
    closer.href = "#";
    closer.id = "popup-closer";
    closer.classList.add("ol-popup-closer");
    popupContainer.appendChild(closer);

    super({
      element: popupContainer,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
      target: options.target,
    });

    closer.onclick = this.closePopup.bind(this);

    this.updatePopupContent = this.updatePopupContent.bind(this);
    this.createPopupMessage = this.createPopupMessage.bind(this);
    this.updateChartData = this.updateChartData.bind(this);
    this.getPopupData = this.getPopupData.bind(this);

    this.popupContent = popupContent;
    this.popupContainer = popupContainer;
    this.closer = closer;
    this.layerFilter = layer;

    this.popupState = false;
  }

  showPopup(event) {
    // Creates popup with feature details on feature click
    const clickedFeature = this.getMap().forEachFeatureAtPixel(
      event.pixel,
      (feature) => feature,
      this.layerFilter
    );
    const clickedPixel = event.pixel;

    if (clickedFeature != undefined) {
      this.clickedFeature = clickedFeature;
      this.clickedFeaturePixel = clickedPixel;
      this.popupData = this.getPopupData();
      this.getMap().forEachFeatureAtPixel(
        event.pixel,
        this.updatePopupContent,
        this.layerFilter
      );
      // TODO: getFeatures(pixel) might be better performance, but less accuracy?
      const clickedCoordinate = event.coordinate;
      this.setPosition(clickedCoordinate);

      if (this.chart) {
        this.updateChartData();
      }
    } else {
      console.log("clickedFeature is undefined");
    }

    this.popupState = true;
  }

  closePopup() {
    // Removes popup overlay
    this.setPosition(undefined);
    this.closer.blur();
    this.popupState = false;
    return false;
  }

  updatePopupContent() {
    // General function for setting popup overlay text
    if (this.clickedFeature != undefined) {
      const message = this.createPopupMessage();
      this.popupContent.innerHTML = message;
    }
  }

  createPopupMessage() {
    // Creation of popup overlay text specific to map of housing prices
    const dataDate = this.layerFilter.animation.activeFilter;
    const placeName = this.popupData[0].RegionName;
    let housePrice;
    try {
      housePrice = dollarsWhole.format(
        this.popupData.filter((item) => item.year === dataDate)[0].value
      );
    } catch {
      housePrice = "No data available";
    }

    const message =
      "<h1>" +
      placeName +
      "</h1><h2>Typical home price in " +
      "<strong>" +
      dataDate +
      "</strong>" +
      ":</h2>\n<h3> " +
      housePrice +
      "</h3>";

    return message;
  }

  getPopupData() {
    // Gets data related to clicked feature from map layer, for plotting, etc.
    const filterVal =
      this.layerFilter.animation.animatedFieldUnique[
        this.layerFilter.animation.frame
      ];
    const dataUniqueName = this.clickedFeature.values_.RegionName;
    const featureData = this.layerFilter
      .getSource()
      .getFeatures()
      .filter((item) => item.values_.RegionName === dataUniqueName);
    const popupData = featureData.map((item) => item.values_);
    popupData.sort((a, b) => a.year - b.year);
    return popupData;
  }

  updateChartData() {
    // Sets chart data to dataset stored in popup overlay's popupData
    this.chart.updateSeries([{data: this.popupData.map((item) => item.value)}], true);
    
    this.chart.updateOptions({
      series: [
        {
          name: this.popupData[0].RegionName,
          data: this.popupData.map((item) => item.value),
        },
      ],
      xaxis: {
        categories: this.popupData.map((item) => item.year),
      },
      title: {
        text: this.popupData[0].RegionName,
      },
    }, 
    true, // reDrawPaths = true
    true // animate = true
    );
  }
}

export default Popup;
