import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4plugins_timeline from "@amcharts/amcharts4/plugins/timeline";
import * as am4plugins_bullets from "@amcharts/amcharts4/plugins/bullets";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

// const restEndpoint = "https://randomuser.me/api/";
const restEndpoint = "http://localhost:5000/getData";

const callRestApi = async () => {
  const response = await fetch(restEndpoint);
  const jsonResponse = await response.json();
  console.log(jsonResponse);

  return jsonResponse;
};

function RenderResult() {
  const chart = useRef(null);

  // Color HEX code for the political parties
  const partyColor = {
    Democratic: "#2502fe",
    "Democratic-Republican": "#0e7003",
    Federalist: "#e28665",
    Republican: "#e0001b",
    Unaffiliated: "#d5d5d5",
    Whig: "#ebbd50",
  };

  const [apiResponse, setApiResponse] = useState("*** now loading ***");

  useEffect(() => {
    callRestApi().then((result) => {
      setApiResponse(result);
      let x = am4core.create("chartdiv", am4plugins_timeline.SerpentineChart);
      // Space between the chart & border
      x.paddingTop = 100;
      // Number of straight lines of serpentine shape
      x.levelCount = 5;
      // Allow bullets to 'bleed' over the edge
      x.maskBullets = false;
      // Input & Output Date format
      x.dateFormatter.inputDateFormat = "yyyy-MM-dd";
      x.dateFormatter.dateFormat = "yyyy-MM-dd";
      // Font size
      x.fontSize = 12;
      x.tooltipContainer.fontSize = 12;

      x.data = result.records.map((rec, index) => {
        console.log(rec);
        return {
          // TODO: Text above the PinBullet; President's name
          text: rec.first.value,
          // TODO: PinBullet's & time period's color; Party color
          color: partyColor[rec.party.value],
          // TODO: Time period's start; Term's start
          start: rec.start.value,
          // TODO: Time period's end; Term's end
          end: rec.end.value,
          // TODO: Icon inside the PinBullet; President's icon
          icon: rec.image.value,
          category: "", // Timeline category; leave as empty string
        };
      });

      // Create 1 timeline with all the US Presidents
      const categoryAxis = x.yAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "category";

      // Axis using date & time scale
      const dateAxis = x.xAxes.push(new am4charts.DateAxis());
      // Gray, dashed lines for date axis
      dateAxis.renderer.line.strokeDasharray = "1,4";
      dateAxis.renderer.line.strokeOpacity = 1;
      // Place the label in the middle of the axis
      dateAxis.renderer.labels.template.verticalCenter = "middle";

      // Series containing the US Presidents and their terms
      const series = x.series.push(new am4plugins_timeline.CurveColumnSeries());
      series.dataFields.openDateX = "start";
      series.dataFields.dateX = "end";
      series.dataFields.categoryY = "category";
      series.baseAxis = categoryAxis;
      // Coloring of the Presidential terms
      series.columns.template.height = am4core.percent(15);
      series.columns.template.propertyFields.fill = "color";
      series.columns.template.propertyFields.stroke = "color";
      series.columns.template.strokeOpacity = 0;
      series.columns.template.fillOpacity = 0.6;

      // Create the PinBullet (Circles)
      const pinBullet = series.bullets.push(new am4plugins_bullets.PinBullet());
      pinBullet.locationX = 1; //Place the PinBullet at their term's start
      pinBullet.propertyFields.stroke = "color";
      pinBullet.background.propertyFields.fill = "color";
      pinBullet.image = new am4core.Image();
      pinBullet.image.propertyFields.href = "icon";

      // President's name over the icon
      const labelBullet = series.bullets.push(new am4charts.LabelBullet());
      labelBullet.label.propertyFields.text = "text";
      labelBullet.label.textAlign = "middle";
      labelBullet.locationX = 1; // Place the labelBullet at their term's start
      labelBullet.dy = -80; // Raising text above the icon

      // Scrollbar used to focus the timeline
      x.scrollbarX = new am4core.Scrollbar();
      x.scrollbarX.align = "center";
      x.scrollbarX.width = am4core.percent(75);
      x.scrollbarX.parent = chart.bottomAxesContainer;

      // Year appearing when hovering over the chart axis
      const cursor = new am4plugins_timeline.CurveCursor();
      x.cursor = cursor;
      dateAxis.tooltipDateFormat = "yyyy-MMM";
      cursor.xAxis = dateAxis;
      cursor.lineY.disabled = true; // Disable Y line highlight

      // Optional - Enable export
      x.exporting.menu = new am4core.ExportMenu();
      // Remove unneeded Scrollbar & tooltip
      x.scrollbarX.exportable = false;
      dateAxis.tooltip.exportable = false;

      chart.current = x;

      return () => {
        x.dispose();
      };
    });
  }, []);

  return <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>;
}

ReactDOM.render(<RenderResult />, document.querySelector("#root"));
