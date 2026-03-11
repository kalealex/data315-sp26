<script>
    import * as d3 from 'd3';
    import {legendColor} from 'd3-svg-legend';

    export let data;
    export let fullData;

    let width = 500;
    let height = 500;

    let proj = d3.geoMercator()
        .scale(40000)
        .center([-87.39, 41.52])
        .translate([width, height]);
    let path = d3.geoPath().projection(proj);

    // $: scale = d3.scaleOrdinal(d3.schemeDark2)
    //   .domain(d3.extent(data.map((d) => +d.properties.name10)));
    // $: scale = d3.scaleSequential(d3.interpolateGreens)
    //   .domain(d3.extent(data.map((d) => +d.properties.walkability)));
    $: scale = d3.scaleSequential(d3.interpolatePiYG)
        .domain([d3.min(data.map((d) => +d.properties.population)), d3.median(data.map((d) => +d.properties.population)), d3.max(data.map((d) => +d.properties.population))]);

    let legend;
    $: {	
            const colorLegend = legendColor()
                .shape('rect')
                .cells(9)
                .scale(scale);
            
            d3.select(legend)
                .call(colorLegend);
        }
</script>

<main>
    <svg {width} {height}>
        {#each data as d}
          <path style = "fill: {scale(+d.properties.population)};"
            d={path(d)}/>
        {/each}
        {#each fullData as d}
          <path class = "geooverlay"
            d={path(d)}/>
        {/each}

        <g transform="translate({width - 100}, 50)"
              bind:this={legend} />
      </svg>
</main>

<style>
    .geooverlay {
      stroke: grey;
      stroke-width: 1px;
      fill: none;
    }
  </style>