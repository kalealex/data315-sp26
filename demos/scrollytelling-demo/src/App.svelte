<script>
  import * as d3 from "d3";
  import * as topojson from "topojson-client";
  import { onMount } from "svelte";

  import { stages } from "./stories/story.js";

  import Scatterplot from "./components/Scatterplot.svelte";
  import BarChart from "./components/BarChart.svelte";
  import CityMap from "./components/CityMap.svelte";

  let stageIndex = 0;
  $: stage = stages[stageIndex];

  let data = [];
  let stateFeatures = null;
  let stateMesh = null;

  // --- Layout system ---
  function getLayoutName(views) {
    const s = !!views.scatter, m = !!views.map, b = !!views.bars;
    if (s && m && b) return "full";
    if (s && b) return "scatter-bar";
    if (m && b) return "map-bar";
    if (s) return "scatter-only";
    if (b) return "bar-only";
    if (m) return "map-only";
    return "full";
  }

  $: layoutName = getLayoutName(stage.views);

  // Track last-known props so inactive components keep valid data while fading out
  let scatterXVar = "median_income", scatterYVar = "median_rent";
  let barXVar = "median_income";
  let scatterAnnotations = [];
  let barAnnotation = null;
  let mapAnnotations = [];

  $: if (stage.views.scatter) {
    scatterXVar = stage.views.scatter.xVar;
    scatterYVar = stage.views.scatter.yVar;
  }
  $: if (stage.views.bars) {
    barXVar = stage.views.bars.xVar;
  }

  $: if (stage.annotations?.scatter) {
    scatterAnnotations = stage.annotations.scatter;
  } else if (stage.views.scatter) {
    scatterAnnotations = [];
  }
  $: if (stage.annotations?.bars) {
    barAnnotation = stage.annotations.bars;
  } else if (stage.views.bars) {
    barAnnotation = null;
  }
  $: if (stage.annotations?.map) {
    mapAnnotations = stage.annotations.map;
  } else if (stage.views.map) {
    mapAnnotations = [];
  }

  let dashW = 0, dashH = 0;
  const PAD = 16, GAP = 16;

  $: slots = computeSlots(layoutName, dashW, dashH);

  function computeSlots(layout, W, H) {
    const w = W - 2 * PAD;
    const h = H - 2 * PAD;
    const half = (w - GAP) / 2;
    const L = PAD, R = PAD + half + GAP;

    // Default "full" positions — used for inactive slots
    const defaults = {
      scatter: { x: L, y: PAD, w: half, h: h },
      map:     { x: R, y: PAD, w: half, h: (h - GAP) * 0.45 },
      bars:    { x: R, y: PAD + (h - GAP) * 0.45 + GAP, w: half, h: (h - GAP) * 0.55 },
    };

    let active = {};
    switch (layout) {
      case "full":
        active = { scatter: defaults.scatter, map: defaults.map, bars: defaults.bars };
        break;
      case "scatter-bar":
        active = {
          scatter: { x: L, y: PAD, w: half, h: h },
          bars:    { x: R, y: PAD, w: half, h: h },
        };
        break;
      case "map-bar":
        active = {
          map:  { x: L, y: PAD, w: half, h: h },
          bars: { x: R, y: PAD, w: half, h: h },
        };
        break;
      case "scatter-only":
        active = { scatter: { x: L, y: PAD, w: w, h: h } };
        break;
      case "bar-only":
        active = { bars: { x: L, y: PAD, w: w, h: h } };
        break;
      case "map-only":
        active = { map: { x: L, y: PAD, w: w, h: h } };
        break;
    }

    return {
      scatter: { ...(active.scatter || defaults.scatter), active: !!active.scatter },
      map:     { ...(active.map || defaults.map),         active: !!active.map },
      bars:    { ...(active.bars || defaults.bars),        active: !!active.bars },
    };
  }

  // --- IntersectionObserver action ---
  function observe(node) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index);
            if (!isNaN(idx)) stageIndex = idx;
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return {
      destroy() {
        observer.disconnect();
      }
    };
  }

  onMount(async () => {
    data = await d3.csv("housing-demo-data.csv", d => ({
      city_name: d.city_name,
      state: d.state,
      region: d.region,

      median_income: +d.median_income,
      median_rent: +d.median_rent,
      median_home_price: +d.median_home_price,
      population: +d.population,

      latitude: +d.latitude,
      longitude: +d.longitude,

      rent_burden: +d.rent_burden,
      home_price_to_income_ratio: +d.home_price_to_income_ratio,
      years_to_twenty_percent_down_payment: +d.years_to_twenty_percent_down_payment
    }));

    const us = await d3.json("states-10m.json");
    const excludeIds = ["02", "15"]; // Alaska, Hawaii (FIPS codes)
    const allFeatures = topojson.feature(us, us.objects.states);
    stateFeatures = {
      type: "FeatureCollection",
      features: allFeatures.features.filter(f => !excludeIds.includes(f.id))
    };
    stateMesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b && !excludeIds.includes(a.id) && !excludeIds.includes(b.id));
  });
</script>

<main>
    <div class="scrollyteller">
        <section class="title text">
            <h2>Housing Affordability in the US</h2>
        </section>
        <div class="text">
            {#each stages as s, i}
            <section
                class="step"
                id={s.id}
                data-index={i}
                use:observe
            >
                {@html s.copy}
            </section>
            {/each}
        </div>

        <div class="dashboard" bind:clientWidth={dashW} bind:clientHeight={dashH}>
            {#if data.length}
                <div class="slot" class:inactive={!slots.scatter.active}
                    style:left="{slots.scatter.x}px" style:top="{slots.scatter.y}px"
                    style:width="{slots.scatter.w}px" style:height="{slots.scatter.h}px">
                    <Scatterplot
                        width={slots.scatter.w} height={slots.scatter.h}
                        data={data}
                        xVar={scatterXVar}
                        yVar={scatterYVar}
                        highlightedCities={stage.highlightedCities}
                        annotations={scatterAnnotations}
                    />
                </div>
            {/if}

            {#if data.length && stateFeatures}
                <div class="slot" class:inactive={!slots.map.active}
                    style:left="{slots.map.x}px" style:top="{slots.map.y}px"
                    style:width="{slots.map.w}px" style:height="{slots.map.h}px">
                    <CityMap
                        width={slots.map.w} height={slots.map.h}
                        data={data}
                        geojson={stateFeatures}
                        mesh={stateMesh}
                        highlightedCities={stage.highlightedCities}
                        annotations={mapAnnotations}
                    />
                </div>
            {/if}

            {#if data.length}
                <div class="slot" class:inactive={!slots.bars.active}
                    style:left="{slots.bars.x}px" style:top="{slots.bars.y}px"
                    style:width="{slots.bars.w}px" style:height="{slots.bars.h}px">
                    <BarChart
                        width={slots.bars.w} height={slots.bars.h}
                        data={data}
                        xVar={barXVar}
                        highlightedCities={stage.highlightedCities}
                        annotation={barAnnotation}
                    />
                </div>
            {/if}
        </div>
    </div>
</main>

<style>
.scrollyteller {
  position: relative;
  display: grid;
  grid-template-columns: 1fr minmax(auto, 32rem) 1fr;
}

/* ---- BACKGROUND DASHBOARD ---- */
.dashboard {
  position: fixed;
  top: 3rem;
  left: 0;
  right: 0;
  height: calc(100vh - 3rem);
  z-index: 0;
  pointer-events: none;
}

.slot {
  position: absolute;
  transition: left 0.5s ease, top 0.5s ease, width 0.5s ease, height 0.5s ease, opacity 0.5s ease;
}

.slot.inactive {
  opacity: 0;
  pointer-events: none;
}

/* ---- FOREGROUND TEXT ---- */
.text {
  position: relative;
  z-index: 1;
  grid-column: 2;
  padding: 2rem;
}

.title {
  grid-column: 2;
  margin-bottom: 5vh;
  background: rgba(255, 255, 255, 0.85);
  padding: 1rem 1.5rem;
  border-radius: 6px;
}

.step {
  margin-bottom: 80vh;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.85);
  padding: 1rem 1.5rem;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
</style>
