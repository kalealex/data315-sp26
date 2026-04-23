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

    // group by species and compute mean petal_length
    let speciesData = d3.rollups(data, (v) => d3.mean(v, (d) => +d.petal_length), (d) => d.species)
      .map(([species, meanPetalLength]) => ({species, meanPetalLength}));

    // set new xScale (band scale for species)
    xScale = d3.scaleBand()
      .range([0, chartW])
      .domain(speciesData.map((d) => d.species))
      .padding(0.2);

    // render xAxis
    d3.select(xAxis)
      .call(d3.axisBottom(xScale));
    d3.select(xAxis)
      .append("text")
      .style("font-family", "sans-serif")
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .style("fill", "black")
      .style("transform", `translate(${chartW / 2}px, 35px)`)
      .text("Species");

    // set new yScale based on max mean petal_length
    yScale = d3.scaleLinear()
      .range([chartH, 0])
      .domain([0, d3.max(speciesData, (d) => d.meanPetalLength)])
      .nice();

    // render yAxis
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
      .text("Mean Petal Length");

    let colorScale = d3.scaleOrdinal()
      .domain(speciesData.map((d) => d.species))
      .range(["#e15759", "#4e79a7", "#59a14f"]);

    d3.select(marks)
      .selectAll("rect")
      .data(speciesData).enter()
      .append("rect")
      .style("fill", (d) => colorScale(d.species))
      .attr("x", (d) => xScale(d.species))
      .attr("width", xScale.bandwidth())
      .attr("y", (d) => yScale(d.meanPetalLength))
      .attr("height", (d) => yScale(0) - yScale(d.meanPetalLength));

    // legend
    let legendG = d3.select(marks)
      .append("g")
      .attr("transform", `translate(${chartW / 12}, 0)`);

    speciesData.forEach((d, i) => {
      let row = legendG.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      row.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", colorScale(d.species));
      row.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .style("font-family", "sans-serif")
        .style("font-size", "11px")
        .text(d.species);
    });
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