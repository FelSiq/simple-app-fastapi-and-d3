const mainSection = d3.select("#main-section")
  .append("svg")
    .style("outline", "3px solid black")
    .style("background-color", "#87ceeb")
    .attr("width", 1024)
    .attr("height", 640)
      .append("text")
        .attr("x", 1024 * 0.5)
        .attr("y", 640 * 0.5)
        .attr("font-size", 32)
        .attr("transform", "translate(-250, 0)")
        .style("user-select", "none")
        .text("Please fetch data to visualize.");


const mainSVG = d3.select("#main-section").select("svg");
const metadata = {};
d3.select("#button-k-means").attr("disabled", true);


function fn_fetchData(url) {
  fetch(url)
    .then(function (response) { return response.json(); })
    .then(function (data) {
      const points = data["data"];

      const x_max = data["range_max"][0];
      const x_min = data["range_min"][0];
      const x_ptp = x_max - x_min;

      const y_max = data["range_max"][1];
      const y_min = data["range_min"][1];
      const y_ptp = y_max - y_min;

      d3.select("#button-k-means").attr("disabled", null);

      mainSVG.selectAll("*").remove();

      mainSVG
        .append("text")
          .attr("x", 4)
          .attr("y", mainSVG.attr("height") - 4)
          .attr("size", 16)
          .style("user-select", "none")
          .text("y=" + y_min + ", x=" + x_min);

      mainSVG
        .append("text")
          .attr("x", 4)
          .attr("y", 20)
          .attr("size", 16)
          .style("user-select", "none")
          .text("y=" + y_max);

      mainSVG
        .append("text")
          .attr("x", mainSVG.attr("width") - 64)
          .attr("y", mainSVG.attr("height") - 4)
          .attr("size", 16)
          .style("user-select", "none")
          .text("x=" + x_max);

      mainSVG.selectAll("circle")
        .data(points).enter()
        .append("g")
          .append("circle")
            .attr("id", function(d, i) { return "svg-p-" + i; })
            .attr("cx", function(d, i) { return ((d[0] - x_min) / x_ptp * (0.90 - 0.10) + 0.10 ) * mainSVG.attr("width"); })
            .attr("cy", function(d, i) { return ((d[1] - y_min) / y_ptp * (0.90 - 0.10) + 0.10 ) * mainSVG.attr("height"); })
            .attr("r", 16)
            .attr("fill", "black")
            .style("stroke", "red")
            .style("stroke-width", 0)
            .on("mouseenter", function() { d3.select(this).style("stroke-width", 10); })
            .on("mouseleave", function() { d3.select(this).style("stroke-width", 0); });
    });
}


function fn_runKMeans() {
  if (!metadata["loaded_data"]) { return; }

  const colors = ["red", "blue", "green", "purple"];
  let k = +d3.select("#k-value").property("value");
  k = Math.min(k, 4);
  k = Math.max(k, 2);


  fetch("http://127.0.0.1:8000/k-means/" + metadata["loaded_data"] + "?k=" + k)
    .then(function(response) { return response.json(); } )
    .then(function(data) {
      const cluster_ids = data["cluster_ids"];
      const edges = data["mst"];

      mainSVG.selectAll("line").remove();
      mainSVG.selectAll("g").select("text").remove();

      mainSVG.selectAll("g")
        .select("circle")
          .style("fill", function(d, i) { return colors[cluster_ids[i]]; });

      mainSVG.selectAll("g")
        .append("text")
          .attr("x", function() { return d3.select(this.parentNode).select("circle").attr("cx"); })
          .attr("y", function() { return d3.select(this.parentNode).select("circle").attr("cy"); })
          .attr("font-size", 16)
          .attr("fill", "black")
          .style("user-select", "none")
          .text(function(d, i) { return ("[" + cluster_ids[i] + "]"); });

      mainSVG.selectAll("line")
        .data(edges).enter()
          .insert("line", "g")
            .attr("x1", function(d, i) { return d3.select("#svg-p-" + d[0]).attr("cx"); })
            .attr("x2", function(d, i) { return d3.select("#svg-p-" + d[1]).attr("cx"); })
            .attr("y1", function(d, i) { return d3.select("#svg-p-" + d[0]).attr("cy"); })
            .attr("y2", function(d, i) { return d3.select("#svg-p-" + d[1]).attr("cy"); })
            .style("stroke", function(d, i) { return colors[cluster_ids[d[0]]]; })
            .style("stroke-width", 3);
    });
}


d3.select("#button-k-means")
  .style("background-color", "#f44336")
  .style("color", "white")
  .style("font-size", "16px")
  .on("click", function() { fn_runKMeans(); });


d3.select("#button-data-01")
  .style("background-color", "#4caf50")
  .style("color", "white")
  .style("font-size", "16px")
  .on("click", function() {
    fn_fetchData("http://127.0.0.1:8000/data/test_data_01");
    metadata["loaded_data"] = "test_data_01";
  });

d3.select("#button-data-02")
  .style("background-color", "#4caf50")
  .style("color", "white")
  .style("font-size", "16px")
  .on("click", function() {
    fn_fetchData("http://127.0.0.1:8000/data/test_data_02");
    metadata["loaded_data"] = "test_data_02";
  });

