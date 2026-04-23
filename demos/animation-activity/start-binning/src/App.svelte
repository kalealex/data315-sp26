<script>
  import * as d3 from 'd3';
	import {onMount} from 'svelte';

  const margin = {top: 50, right: 50, bottom: 60, left: 60};
  const width = 500
  const height = 400;
  const chartW = width - margin.left - margin.right;
  const chartH = height - margin.top - margin.bottom;

  const refDate = new Date("2020-01-21");

	let data = [];

	onMount(async function() {
    await d3.csv('iris.csv').then((source) => {
      data = [...source];
      console.log(data);

      initialRender();
    });
	});

  let xScale;
  let xAxis;
  let yScale;
  let yAxis;
  let marks;

  function initialRender() {
    xScale = d3.scaleLinear()
      .range([0, chartW])
      .domain(d3.extent(data, (d) => +d.petal_width));

    d3.select(xAxis)
      .call(d3.axisBottom(xScale));
    d3.select(xAxis)
      .append("text")
      .style("font-family", "sans-serif")
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .style("fill", "black")
      .style("transform", `translate(${chartW / 2}px, 35px)`)
      .text("Petal Width");

    yScale = d3.scaleLinear()
      .range([chartH, 0])
      .domain(d3.extent(data, (d) => +d.petal_length));

    d3.select(yAxis)
      .call(d3.axisLeft(yScale));
    d3.select(yAxis)
      .append("text")
      .attr("class", "title")
      .style("font-family", "sans-serif")
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .style("fill", "black")
      .style("text-anchor", "middle")
      .style("transform", `translate(${-margin.left / 2}px, ${chartH / 2}px) rotate(-90deg)`)
      .text("Petal Length");

    d3.select(marks)
      .selectAll("circle")
      .data(data).enter()
      .append("circle")
      .style("fill", "steelblue")
      .style("opacity", 0.7)
      .attr("cx", (d) => xScale(+d.petal_width))
      .attr("cy", (d) => yScale(+d.petal_length))
      .attr("r", 3);
  }

  function update() {
    clearChart(); // shouldn't do this for an animated transition

    // set new xScale and bin data
    xScale = d3.scaleLinear()
      .range([0, chartW])
      .domain(d3.extent(data.map((d) => +d.petal_width)))
      .nice();
    let binData = d3.histogram()
        .value((d) => +d.petal_width)
        .domain(xScale.domain())
        .thresholds(xScale.ticks(12));
    let bins = binData(data);

    // render xAxis
    d3.select(xAxis)
      .call(d3.axisBottom(xScale));
    d3.select(xAxis) // you won't need to redo the axis title if updating
      .append("text") 
      .style("font-family", "sans-serif")
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .style("fill", "black")
      .style("transform", `translate(${chartW / 2}px, 35px)`)
      .text("Petal Width (binned)"); // updated title (optional)

    // set new yScale based on max count
    yScale = d3.scaleLinear()
      .range([chartH, 0])
      .domain([0, d3.max(bins, (d) => d.length)]);
    
    // render yAxis
    d3.select(yAxis)
      .call(d3.axisLeft(yScale));
    d3.select(yAxis)
      .append("text") // you won't need to recreate this element if updating
      .attr("class", "title")
      .style("font-family", "sans-serif")
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .style("fill", "black")
      .style("text-anchor", "middle")
      .style("transform", `translate(${-margin.left / 2}px, ${chartH / 2}px) rotate(-90deg)`)
      .text("Count"); // updated title (necessary)

    let padding = 2; // px between bars
    d3.select(marks)
      .selectAll("rect")
      .data(bins).enter() // notice we're binding bins to rectangles, not data
      .append("rect")
      .style("fill", "steelblue")
      .attr("x", (d) => xScale(d.x0) + padding / 2)
      .attr("width", (d) => xScale(d.x1) - xScale(d.x0) - padding / 2)
      .attr("y", (d) => yScale(d.length))
      .attr("height", (d) => yScale(0) - yScale(d.length));
  }

  function clearChart() {
    d3.select(marks)
      .selectAll("*")
      .remove();
    d3.select(xAxis)
      .selectAll("*")
      .remove();
    d3.select(yAxis)
      .selectAll("*")
      .remove();
  }

  function reset() {
    clearChart();
    initialRender();
  }
</script>

<main>
  <h1>Animated Transitions</h1>

  <svg {width} {height}>
    <g 
      style="transform: translate({margin.left}px, {margin.top}px)" 
      bind:this={marks}></g>
    <g 
      style="transform: translate({margin.left}px, {height - margin.bottom}px)" 
      bind:this={xAxis}></g>
    <g 
      style="transform: translate({margin.left}px, {margin.top}px)" 
      bind:this={yAxis}></g>
  </svg>

  <br/>
  <button on:click={update}>Animate</button>
  <button on:click={reset}>Reset</button>
</main>

<style>
  button {
      border: none;
      padding: 0.5rem 2rem;
      color: slategrey;
      font-size: 1.5rem;
      border-radius: 1rem;
      transition: all 250ms;
      transform-origin: center;
      box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.25),
      inset 0px -2px 3px rgba(0, 0, 0, 0.25);
  }
  button:hover {
      cursor: pointer;
      transform: scale(0.975);
      box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.25);
  }
</style>