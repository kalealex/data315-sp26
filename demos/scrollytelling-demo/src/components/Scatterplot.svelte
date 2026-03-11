<script>
  import * as d3 from 'd3';
  import { varLabels } from "../stories/story.js";

  // --- Props ---
  export let data = [];
  export let xVar;
  export let yVar;
  export let highlightedCities = [];
  export let annotations = [];

  // --- Resolve label position with edge-clipping detection ---
  const DIR_OFFSETS = {
    N:  { dx: 0,  dy: -1, anchor: "middle" },
    S:  { dx: 0,  dy:  1, anchor: "middle" },
    E:  { dx:  1, dy:  0, anchor: "start" },
    W:  { dx: -1, dy:  0, anchor: "end" },
    NE: { dx:  1, dy: -1, anchor: "start" },
    NW: { dx: -1, dy: -1, anchor: "end" },
    SE: { dx:  1, dy:  1, anchor: "start" },
    SW: { dx: -1, dy:  1, anchor: "end" },
  };
  const FLIP_H = { E:"W", W:"E", NE:"NW", NW:"NE", SE:"SW", SW:"SE", N:"N", S:"S" };
  const FLIP_V = { N:"S", S:"N", NE:"SE", SE:"NE", NW:"SW", SW:"NW", E:"E", W:"W" };

  function resolveLabel(baseX, baseY, direction, text, bounds, d = 12, fontSize = 12) {
    const charW = fontSize * 0.6;
    const textW = text.length * charW;
    const textH = fontSize;
    const [minX, minY, maxX, maxY] = bounds;

    function test(dir) {
      const o = DIR_OFFSETS[dir] || DIR_OFFSETS.E;
      const x = baseX + o.dx * d, y = baseY + o.dy * d;
      const left  = o.anchor === "start" ? x : o.anchor === "end" ? x - textW : x - textW / 2;
      const right = left + textW;
      return {
        x, y, anchor: o.anchor,
        clipsH: left < minX || right > maxX,
        clipsV: (y - textH / 2) < minY || (y + textH / 2) > maxY,
      };
    }

    // Try preferred direction, then flip on clipping axis, then flip both
    for (const dir of [
      direction,
      FLIP_H[direction],
      FLIP_V[direction],
      FLIP_V[FLIP_H[direction]],
    ]) {
      const r = test(dir);
      if (!r.clipsH && !r.clipsV) return { x: r.x, y: r.y, anchor: r.anchor };
    }

    // Last resort: clamp the preferred position
    let { x, y, anchor } = test(direction);
    const left  = anchor === "start" ? x : anchor === "end" ? x - textW : x - textW / 2;
    const right = left + textW;
    if (right > maxX) x -= right - maxX;
    if (left  < minX) x += minX - left;
    if (y - textH / 2 < minY) y = minY + textH / 2;
    if (y + textH / 2 > maxY) y = maxY - textH / 2;
    return { x, y, anchor };
  }

  // --- Layout ---
  let margin = { top: 20, right: 20, bottom: 50, left: 70 };
  export let width = 550;
  export let height = 665;
  $: chartW = width - margin.left - margin.right;
  $: chartH = height - margin.top - margin.bottom;

  // --- DOM refs ---
  let xAxisEl;
  let yAxisEl;
  let pointsLayer;
  let labelsLayer;

  // --- Scales (reactive) ---
  $: xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d[xVar]))
    .nice()
    .range([0, chartW]);

  $: yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d[yVar]))
    .nice()
    .range([chartH, 0]);

  // --- Axis generators ---
  const xAxis = d3.axisBottom();
  const yAxis = d3.axisLeft();

  // --- Axis + mark transitions ---
  $: if (xAxisEl && yAxisEl && pointsLayer && labelsLayer && data.length) {
    const t = d3.transition().duration(750).ease(d3.easeCubicOut);

    // Update axes
    d3.select(xAxisEl)
      .transition(t)
      .call(xAxis.scale(xScale));

    d3.select(yAxisEl)
      .transition(t)
      .call(yAxis.scale(yScale));

    // Update points
    d3.select(pointsLayer)
      .selectAll("circle")
      .data(data) //, d => d.city_name)
      .join(
        enter => enter.append("circle")
          .attr("cx", d => xScale(d[xVar]))
          .attr("cy", d => yScale(d[yVar]))
          .attr("r", 0)
          .attr("fill", d => highlightedCities.includes(d.city_name) ? "crimson" : "steelblue")
          .attr("opacity", 0.8)
          .call(enter => enter.transition(t).attr("r", 8)),

        update => update
          .call(update => update.transition(t)
            .attr("cx", d => xScale(d[xVar]))
            .attr("cy", d => yScale(d[yVar]))
            .attr("r", 8)
            .attr("fill", d => highlightedCities.includes(d.city_name) ? "crimson" : "steelblue")
          ),

        exit => exit
          .call(exit => exit.transition(t).attr("r", 0).remove())
      );

    // --- City labels for highlighted points ---
    const labelData = data.filter(d => highlightedCities.includes(d.city_name));

    d3.select(labelsLayer)
      .selectAll("text.city-label")
      .data(labelData, d => d.city_name)
      .join(
        enter => enter.append("text")
          .attr("class", "city-label")
          .attr("x", d => xScale(d[xVar]) + 10)
          .attr("y", d => yScale(d[yVar]))
          .attr("dy", "0.35em")
          .attr("font-size", "12px")
          .attr("fill", "crimson")
          .attr("font-weight", "600")
          .style("paint-order", "stroke")
          .style("stroke", "white")
          .style("stroke-width", "3px")
          .text(d => d.city_name)
          .attr("opacity", 0)
          .call(enter => enter.transition(t).attr("opacity", 1)),

        update => update
          .call(update => update.transition(t)
            .attr("x", d => xScale(d[xVar]) + 10)
            .attr("y", d => yScale(d[yVar]))
            .text(d => d.city_name)
          ),

        exit => exit
          .call(exit => exit.transition(t).attr("opacity", 0).remove())
      );
  }
</script>

<svg {width} {height}>
  <g transform="translate({margin.left}, {margin.top})">

    <!-- Points -->
    <g bind:this={pointsLayer}></g>

    <!-- Annotations -->
    <g class="annotations">
      {#each annotations as ann}
        {@const label = resolveLabel(xScale(ann.x2), yScale(ann.y2), ann.direction, ann.text, [0, 0, chartW, chartH])}
        <line
          x1={xScale(ann.x1)} y1={yScale(ann.y1)}
          x2={xScale(ann.x2)} y2={yScale(ann.y2)}
          stroke="#333" stroke-width="1.5" stroke-dasharray="5 3"
        />
        <text
          x={label.x}
          y={label.y}
          text-anchor={label.anchor}
          dy="0.35em"
          class="annotation-label"
        >{ann.text}</text>
      {/each}
    </g>

    <!-- City labels -->
    <g bind:this={labelsLayer}></g>

    <!-- X axis -->
    <g
      transform="translate(0, {chartH})"
      bind:this={xAxisEl}
    ></g>

    <!-- Y axis -->
    <g bind:this={yAxisEl}></g>

    <!-- Axis labels -->
    <text
      x={chartW / 2}
      y={chartH + 40}
      text-anchor="middle"
      class="axis-label">
      {varLabels[xVar] || xVar}
    </text>

    <text
      transform="rotate(-90)"
      x={-chartH / 2}
      y={-50}
      text-anchor="middle"
      class="axis-label">
      {varLabels[yVar] || yVar}
    </text>

  </g>
</svg>

<style>
  .axis-label {
    font-size: 12px;
    fill: #333;
  }
  .annotation-label {
    font-size: 12px;
    fill: #333;
    font-weight: 600;
    paint-order: stroke;
    stroke: white;
    stroke-width: 3px;
  }
</style>
