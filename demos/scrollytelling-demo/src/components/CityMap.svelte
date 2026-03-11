<script>
  import * as d3 from "d3";

  export let data = [];
  export let geojson = null;
  export let mesh = null;
  export let highlightedCities = [];
  export let annotations = [];

  export let width = 500;
  export let height = 290;

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

  function resolveLabel(baseX, baseY, direction, text, bounds, d = 20, fontSize = 18) {
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

    for (const dir of [
      direction,
      FLIP_H[direction],
      FLIP_V[direction],
      FLIP_V[FLIP_H[direction]],
    ]) {
      const r = test(dir);
      if (!r.clipsH && !r.clipsV) return { x: r.x, y: r.y, anchor: r.anchor };
    }

    let { x, y, anchor } = test(direction);
    const left  = anchor === "start" ? x : anchor === "end" ? x - textW : x - textW / 2;
    const right = left + textW;
    if (right > maxX) x -= right - maxX;
    if (left  < minX) x += minX - left;
    if (y - textH / 2 < minY) y = minY + textH / 2;
    if (y + textH / 2 > maxY) y = maxY - textH / 2;
    return { x, y, anchor };
  }

  // --- Derive annotated cities (look up projected coordinates) ---
  $: annotatedCities = annotations
    .map(ann => {
      const city = cities.find(c => c.city_name === ann.city);
      return city ? { ...ann, cx: city.cx, cy: city.cy } : null;
    })
    .filter(Boolean);

  // Non-reactive projection + path (same pattern as working cartography demo)
  let projection = d3.geoAlbersUsa();
  let path = d3.geoPath().projection(projection);

  // Radii in viewBox coords (scaled ~0.52× in CSS)
  $: rScale = d3.scaleSqrt()
    .domain(d3.extent(data, d => d.population))
    .range([6, 26]);

  $: cities = data
    .map(d => {
      const coords = projection([d.longitude, d.latitude]);
      return coords ? { ...d, cx: coords[0], cy: coords[1] } : null;
    })
    .filter(Boolean);

  const legendItems = [
    { value: 200000, label: "200K" },
    { value: 1000000, label: "1M" },
    { value: 4000000, label: "4M" },
  ];
</script>

<svg viewBox="0 0 960 600" {width} {height}>
  <g id="context">
    {#if geojson}
      {#each geojson.features as feature}
        <path d={path(feature)} fill="#f5f5f5" stroke="none" />
      {/each}
    {/if}
    {#if mesh}
      <path d={path(mesh)} fill="none" stroke="#bbb"
        stroke-width="1" stroke-linejoin="round" />
    {/if}
  </g>
  <g id="cities">
    {#each cities as city}
      <circle cx={city.cx} cy={city.cy} r={rScale(city.population)}
        fill={highlightedCities.includes(city.city_name) ? "crimson" : "steelblue"}
        opacity="0.75" stroke="#fff" stroke-width="1" />
    {/each}
  </g>
  <g class="annotations">
    {#each annotatedCities as ann}
      {@const label = resolveLabel(ann.cx, ann.cy, ann.direction, ann.text, [0, 0, 960, 600])}
      <text
        x={label.x}
        y={label.y}
        text-anchor={label.anchor}
        dy="0.35em"
        class="annotation-label"
      >{ann.text}</text>
    {/each}
  </g>

  <g transform="translate(800, 440)">
    <text font-size="18" fill="#666">Population</text>
    {#each legendItems as item, i}
      {@const r = rScale(item.value)}
      <g transform="translate(0, {30 + i * 40})">
        <circle cx={26} cy="0" {r}
          fill="steelblue" opacity="0.5" stroke="#fff" stroke-width="1" />
        <text x="56" dy="0.35em" font-size="16" fill="#666">{item.label}</text>
      </g>
    {/each}
  </g>
</svg>

<style>
  .annotation-label {
    font-size: 18px;
    fill: crimson;
    font-weight: 600;
    paint-order: stroke;
    stroke: white;
    stroke-width: 3px;
  }
</style>
