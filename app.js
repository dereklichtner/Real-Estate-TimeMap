// jshint esversion: 10

// OpenLayers
import { fromLonLat } from "ol/proj";
import { Attribution, defaults as defaultControls } from "ol/control";
import GeoJSON from "ol/format/GeoJSON";
import Map from "ol/Map";
import OSM from "ol/source/OSM";
import TileLayer from "ol/layer/Tile";
import VectorSource from "ol/source/Vector";
import View from "ol/View";

// Custom OpenLayers extensions
import {
  PlayControl,
  NextFrameControl,
  PrevFrameControl,
  SliderControl,
} from "./src/animate/animateControls";
import AnimatedWebGLPointsLayer from "./src/animate/animatedLayer";
import Popup from "./src/overlay/popup";

//ApexCharts
import ApexCharts from "apexcharts";
import defaultChartOptions from "./src/chart/chartConfig.js";

// MicroModal dialog
import MicroModal from "micromodal";

// Import data
import filterUniqueArray from "./data/dateRange.json";
const dataURL =
  "./data/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_month_cleaned.json";
// TODO: use brokJSON or other compression method to speed up init json loading

// TODO: list:
// - Misc code cleanup
// - Increase performance -- brokJSon or other compression?

// IDEAS for future versions:
// - color data points on chart same as on map
// - label points with price at high zoom?
// - allow adding multiple data series to chart
// - Search bar: to find and zoom to county or zip code (geocode?)
// - legend for point size and color?
// - chart panel resizable, not static ~33% height
// - Layers panel, w/ median wage, median rent?
// - Refactor: manage app state w/ redux?
// - Periodically get data from Zillow API, process in python backend
// - "Take a tour" mode that flies to a series of locations, sharing interesting facts, e.g. "in 1990, this city jumped like crazy bc monkey pox"
// - Vector tiles, from state to county to zip, both homes and rent -- would animate vector tiles even work(?)

// Initiate MicroModal dialog popup
MicroModal.init();
MicroModal.show("modal-startup"); // [1]

// Map view parameters:
const mapProj = "EPSG:3857";

const viewParam = {
  center: fromLonLat([-96, 36], mapProj),
  zoom: 4.5,
  maxZoom: 7,
  minZoom: 4,
  extent: [
    ...fromLonLat([-170, -45], mapProj),
    ...fromLonLat([-38, 83], mapProj),
  ],
  showFullExtent: true,
};

const mapDefaultView = new View({
  projection: mapProj,
  ...viewParam,
});

const defaultAnimationRate = 4;
const animatedFieldName = "year";

// Housing prices vector layer symbology parameters:
const minPriceRange = 35000;
const midPriceRange = 500000;
const maxPriceRange = 1750000;
const minMarkerSize = 8;
const maxMarkerSize = 55;

// Set housing prices vector layer source
const source = new VectorSource({
  attributions:
    'Real estate data © <a href="https://www.zillow.com/research/data/" target="_blank">Zillow</a>. Map design and development by <a href="https://github.com/dereklichtner" target="_blank">Derek T. Lichtner</a>.',
  url: dataURL,
  format: new GeoJSON(),
});

// Define housing prices vector layer style
const housePricesStyle = {
  symbol: {
    symbolType: "circle",
    size: [
      "interpolate",
      ["linear"],
      ["get", "value"],
      minPriceRange,
      minMarkerSize,
      maxPriceRange,
      maxMarkerSize,
    ],
    color: [
      "interpolate",
      ["linear"],
      ["get", "value"],
      minPriceRange,
      "#0f9b50",
      midPriceRange,
      "#9b9b0f",
      maxPriceRange,
      "#9b0f0f",
    ],
    opacity: 0.5,
  },
};

// Create housing prices vector layer
let housePricesLayer = new AnimatedWebGLPointsLayer({
  source: source,
  style: housePricesStyle,
  animatedField: animatedFieldName,
});

// Create basemap tile layer
let basemap = new TileLayer({
  source: new OSM(), // use diff map service for final product
});

// Create popup component for map overlay
const popupOverlay = new Popup(housePricesLayer);

// Make attribution control [i] collapsed by default
const attributions = new Attribution({
  collapsible: true,
});

// Init the map container:
const map = new Map({
  target: "map-container",
  layers: [basemap, housePricesLayer],
  controls: defaultControls({ attribution: false }).extend([
    new PlayControl(housePricesLayer),
    new NextFrameControl(housePricesLayer), // add custom controls after declaration of map?
    new PrevFrameControl(housePricesLayer),
    new SliderControl(housePricesLayer, filterUniqueArray),
    attributions,
  ]),
  overlays: [popupOverlay],
  view: mapDefaultView,
});

// Spinner animation during inital map loading
map.getTargetElement().classList.add("spinner");

// Add event listener to map for showing popup upon clicking a feature
map.on("singleclick", popupOverlay.showPopup.bind(popupOverlay));

// Get array of unique values from field to animate on
// TODO: calculate filterUniqueArray in backend if not already declared
housePricesLayer.animation = {
  ...housePricesLayer.animation,
  animatedFieldUnique: filterUniqueArray,
};

// Create chart for displaying time series of typical house price
popupOverlay.chart = new ApexCharts(
  document.querySelector("#chart"),
  defaultChartOptions
);

// Button for showing/hiding chart
document.querySelector(".toggle-button").addEventListener("click", () => {
  document.getElementById("map-canvas").classList.toggle("panel-top-toggle");
  document
    .getElementById("chart-container")
    .classList.toggle("panel-bottom-toggle");
  document
    .getElementById("toggle-button")
    .classList.toggle("toggle-button-expanded");
  map.updateSize();
});

// Initialize animation capabilities of layer
housePricesLayer.initAnimation({ rate: defaultAnimationRate, startFrame: 26 });
housePricesLayer.animation.slider.updateSliderValue(
  housePricesLayer.animation.frame
);

// Once map inital load is complete...
map.once("rendercomplete", () => {
  // Remove loading spinner
  map.getTargetElement().classList.remove("spinner");

  // Start layer animation
  // housePricesLayer.playAnimation({ rate: defaultAnimationRate });

  // Create popout chart
  popupOverlay.chart.render();
});
