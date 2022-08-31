// jshint esversion: 9

import { dollarsWhole, dollarsDec } from "../util/dollarsFormat";

function labelFormatter(value) {
  // Formats chart price labels as currency, per million or thousand
  if (value >= 1000000) {
    return dollarsDec.format(value / 1000000) + "M";
  } else {
    return dollarsWhole.format(value / 1000) + "k";
  }
}

const defaultChartOptions = {
  series: [
    {
      name: "",
      data: [null],
    },
  ],

  chart: {
    width: "100%",
    height: "100%",
    type: "line",
    toolbar: {
      show: false,
    },
    fontFamily: "DM Sans, sans-serif",
    fontSize: "17px",
    zoom: {
      enabled: false,
    },
  },

  grid: {
    padding: {
      left: 20, // In combo with yaxis/labels/offsetX
    },
  },

  stroke: {
    curve: "straight",
    width: 2,
    colors: "#6590b9",
  },

  markers: {
    size: 5,
    colors: "#6590b9",
    strokeColors: "#fff",
    strokeWidth: 2,
    strokeOpacity: 0.9,
    strokeDashArray: 0,
    fillOpacity: 1,
    discrete: [],
    shape: "circle",
    radius: 2,
    offsetX: 0,
    offsetY: 0,
    onClick: undefined,
    onDblClick: undefined,
    showNullDataPoints: true,
    hover: {
      size: undefined,
      sizeOffset: 3,
    },
  },

  dataLabels: {
    enabled: false,
    formatter: labelFormatter,
  },

  title: {
    text: "Click a data point on the map...",
    align: "left",
  },

  xaxis: {
    // showForNullSeries: false, // Hide axis until data selected
    categories: ["Click a data point on the map..."],
    labels: {
      hideOverlappingLabels: true,
      style: {
        fontSize: "15px", // This gets overwritten in styles.css
      },
    },
    tooltip: {
      style: {
        fontSize: "17px",
      },
    },
  },

  yaxis: {
    showForNullSeries: false, // Hide axis until data selected
    title: {
      text: "Typical Home Price",
      style: {
        fontSize: "15px",
      },
    },
    labels: {
      offsetX: 8, // In combo with grid/padding/left
      maxWidth: "auto",
      formatter: labelFormatter,
      hideOverlappingLabels: true,
    },
  },

  tooltip: {
    x: {
      show: true,
    },
    marker: {
      show: false,
    },
    style: {
      fontSize: "15px",
    },
  },
};

export default defaultChartOptions;
