import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const Chart = ({ data }) => {
  const svgRef = useRef();

  const renderChart = () => {
    if (!data || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Get container dimensions
    const container = svgRef.current.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight || 400; // fallback height

    // Chart dimensions - responsive to container
    const margin = { top: 40, right: 120, bottom: 50, left: 80 };
    const width = Math.max(containerWidth - margin.left - margin.right, 300); // minimum width
    const height = Math.max(containerHeight - margin.top - margin.bottom, 200); // minimum height

    // Create SVG with viewBox for responsiveness
    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr(
        "viewBox",
        `0 0 ${width + margin.left + margin.right} ${
          height + margin.top + margin.bottom
        }`
      )
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Determine chart type by checking first data point
    const isMultiSeries = Array.isArray(data[0][1]);

    if (isMultiSeries) {
      renderMultiSeriesChart(svg, data, width, height);
    } else {
      renderSingleSeriesChart(svg, data, width, height);
    }
  };

  useEffect(() => {
    renderChart();

    // Add debounced resize handler
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        renderChart();
      }, 100); // 100ms delay
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [data]);

  const renderSingleSeriesChart = (svg, data, width, height) => {
    // Filter out null values and ensure we only have valid numeric data
    const validData = data.filter(
      (d) => d[1] !== null && typeof d[1] === "number" && !isNaN(d[1])
    );

    // Much more aggressive data sampling for extremely dense data
    const targetPoints = 200; // Show only 200 points max
    const sampleRate = Math.max(1, Math.floor(validData.length / targetPoints));
    const sampledData = validData.filter((_, i) => i % sampleRate === 0);

    // Additional filtering to remove extreme outliers that cause thick blocks
    const values = sampledData.map((d) => d[1]);
    const q1 = d3.quantile(values, 0.25);
    const q3 = d3.quantile(values, 0.75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const filteredData = sampledData.filter(
      (d) => d[1] >= lowerBound && d[1] <= upperBound
    );

    // Debug info
    console.log(
      `Single Series - Original: ${data.length}, Valid: ${validData.length}, Sampled: ${sampledData.length}, Filtered: ${filteredData.length}`
    );

    // Use filtered data if we have enough points, otherwise fall back to sampled data
    const finalData = filteredData.length > 50 ? filteredData : sampledData;

    // Create scales with padding for better visualization
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(finalData, (d) => d[0]))
      .range([0, width]);

    const yExtent = d3.extent(finalData, (d) => d[1]);
    const yPadding = (yExtent[1] - yExtent[0]) * 0.1; // 10% padding

    const yScale = d3
      .scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([height, 0]);

    // Create line generator with curve interpolation for smoother lines
    const line = d3
      .line()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]))
      .defined((d) => d[1] !== null)
      .curve(d3.curveMonotoneX); // Smooth curve interpolation

    // Add X axis with better formatting
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(".0f")));

    // Add Y axis with better formatting
    svg
      .append("g")
      .call(d3.axisLeft(yScale).ticks(8).tickFormat(d3.format(".3f")));

    // Add grid lines for better readability
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(10).tickSize(-height).tickFormat(""));

    svg
      .append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale).ticks(8).tickSize(-width).tickFormat(""));

    // IMPORTANT: Only render line path - NO circles, NO bullets, NO markers
    // This ensures clean, thin lines without any data point visualization
    svg
      .append("path")
      .datum(finalData)
      .attr("fill", "none")
      .attr("stroke", "#2196F3")
      .attr("stroke-width", 0.8)
      .attr("d", line);
  };

  const renderMultiSeriesChart = (svg, data, width, height) => {
    // Extract series data and ensure we only have valid numeric data
    const series1 = data
      .map((d) => [d[0], d[1][0]])
      .filter((d) => d[1] !== null && typeof d[1] === "number" && !isNaN(d[1]));
    const series2 = data
      .map((d) => [d[0], d[1][1]])
      .filter((d) => d[1] !== null && typeof d[1] === "number" && !isNaN(d[1]));
    const series3 = data
      .map((d) => [d[0], d[1][2]])
      .filter((d) => d[1] !== null && typeof d[1] === "number" && !isNaN(d[1]));

    // Much more aggressive data sampling for extremely dense data
    const targetPoints = 200; // Show only 200 points max per series
    const sampleRate = Math.max(1, Math.floor(data.length / targetPoints));
    const sampledSeries1 = series1.filter((_, i) => i % sampleRate === 0);
    const sampledSeries2 = series2.filter((_, i) => i % sampleRate === 0);
    const sampledSeries3 = series3.filter((_, i) => i % sampleRate === 0);

    // Additional filtering to remove extreme outliers that cause thick blocks
    const filterOutliers = (data) => {
      const values = data.map((d) => d[1]);
      const q1 = d3.quantile(values, 0.25);
      const q3 = d3.quantile(values, 0.75);
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      return data.filter((d) => d[1] >= lowerBound && d[1] <= upperBound);
    };

    const filteredSeries1 = filterOutliers(sampledSeries1);
    const filteredSeries2 = filterOutliers(sampledSeries2);
    const filteredSeries3 = filterOutliers(sampledSeries3);

    // Debug info
    console.log(
      `Multi Series - Original: ${data.length}, Sampled: ${sampledSeries1.length}, Filtered: ${filteredSeries1.length}`
    );

    // Use filtered data if we have enough points, otherwise fall back to sampled data
    const finalSeries1 =
      filteredSeries1.length > 50 ? filteredSeries1 : sampledSeries1;
    const finalSeries2 =
      filteredSeries2.length > 50 ? filteredSeries2 : sampledSeries2;
    const finalSeries3 =
      filteredSeries3.length > 50 ? filteredSeries3 : sampledSeries3;

    // Create scales with padding for better visualization
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d[0]))
      .range([0, width]);

    // Calculate Y domain with padding for better line separation
    const allValues = [
      ...filteredSeries1.map((d) => d[1]),
      ...filteredSeries2.map((d) => d[1]),
      ...filteredSeries3.map((d) => d[1]),
    ].filter((v) => v !== null);

    const yMin = d3.min(allValues);
    const yMax = d3.max(allValues);
    const yRange = yMax - yMin;
    const yPadding = yRange * 0.15; // 15% padding for better separation

    const yScale = d3
      .scaleLinear()
      .domain([yMin - yPadding, yMax + yPadding])
      .range([height, 0]);

    // Create line generators with curve interpolation for smoother lines
    const line1 = d3
      .line()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]))
      .defined((d) => d[1] !== null)
      .curve(d3.curveMonotoneX);

    const line2 = d3
      .line()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]))
      .defined((d) => d[1] !== null)
      .curve(d3.curveMonotoneX);

    const line3 = d3
      .line()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]))
      .defined((d) => d[1] !== null)
      .curve(d3.curveMonotoneX);

    // Add X axis with better formatting
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(".0f")));

    // Add Y axis with better formatting
    svg
      .append("g")
      .call(d3.axisLeft(yScale).ticks(8).tickFormat(d3.format(".3f")));

    // Add grid lines for better readability
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(10).tickSize(-height).tickFormat(""));

    svg
      .append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale).ticks(8).tickSize(-width).tickFormat(""));

    // Add legend
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 100}, 0)`);

    // Series 1 (Blue)
    legend
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 20)
      .attr("y2", 0)
      .attr("stroke", "#2196F3")
      .attr("stroke-width", 0.8);

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 4)
      .text("Series 1")
      .attr("font-size", "12px");

    // Series 2 (Green)
    legend
      .append("line")
      .attr("x1", 0)
      .attr("y1", 20)
      .attr("x2", 20)
      .attr("y2", 20)
      .attr("stroke", "#4CAF50")
      .attr("stroke-width", 0.8);

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 24)
      .text("Series 2")
      .attr("font-size", "12px");

    // Series 3 (Red)
    legend
      .append("line")
      .attr("x1", 0)
      .attr("y1", 40)
      .attr("x2", 20)
      .attr("y2", 40)
      .attr("stroke", "#F44336")
      .attr("stroke-width", 0.8);

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 44)
      .text("Series 3")
      .attr("font-size", "12px");

    // IMPORTANT: Only render line paths - NO circles, NO bullets, NO markers
    // This ensures clean, thin lines without any data point visualization
    svg
      .append("path")
      .datum(finalSeries1)
      .attr("fill", "none")
      .attr("stroke", "#2196F3")
      .attr("stroke-width", 0.8)
      .attr("d", line1);

    svg
      .append("path")
      .datum(finalSeries2)
      .attr("fill", "none")
      .attr("stroke", "#4CAF50")
      .attr("stroke-width", 0.8)
      .attr("d", line2);

    svg
      .append("path")
      .datum(finalSeries3)
      .attr("fill", "none")
      .attr("stroke", "#F44336")
      .attr("stroke-width", 0.8)
      .attr("d", line3);
  };

  return (
    <div className="chart">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Chart;
