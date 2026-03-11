# Scrollytelling Demo — US Housing Affordability

A scroll-driven data story built with Svelte, D3, and a browser-native `IntersectionObserver`. Used as an in-class activity for DATA 31500 (Data Visualization).

## Purpose

This demo separates **narrative authoring** from **visualization implementation**. The three chart components (scatterplot, bar chart, city map) are already built. To compose a data story, you only edit **`src/stories/story.js`** — choosing which views to show, what variables to encode, which cities to highlight, and where to place annotations at each stage of the narrative. The goal is to focus on the rhetorical staging of views: how the sequence of visual states guides a reader through an argument about the data.

## Running

```bash
npm install
npm run dev
```

## The story file — `src/stories/story.js`

The story file is the only file you need to edit. It exports a `stages` array where each object defines one scroll step. As the reader scrolls, the dashboard transitions between stages automatically.

### Stage object reference

```js
{
  id: "my_stage",              // unique identifier (used as HTML id)
  copy: `Narrative text...`,   // shown in the foreground scroll card

  views: {                     // which charts to show + what to encode
    scatter: {                 //   show scatterplot with these variables
      xVar: "median_income",   //   (always a numeric column from the dataset)
      yVar: "rent_burden"
    },
    bars: {                    //   show bar chart ranking cities by this variable
      xVar: "rent_burden"
    },
    map: true                  //   show/hide the city map (true or false)
  },

  highlightedCities: ["Seattle", "Miami"],  // colored crimson in all active views

  annotations: {               // optional overlays per component (omit key if unused)
    scatter: [ ... ],          //   line segments + labels on the scatterplot
    bars:    { ... },          //   threshold annotation on the bar chart
    map:     [ ... ]           //   city labels on the map
  }
}
```

### Layout rules

The dashboard layout is determined automatically from `views`. Set a view to `false` to hide it.

| scatter | bars | map | Layout |
|---------|------|-----|--------|
| `{ }` | `{ }` | `true` | Three-panel (scatter left, map + bars right) |
| `{ }` | `{ }` | `false` | Two-panel: scatter + bars side by side |
| `false` | `{ }` | `true` | Two-panel: map + bars side by side |
| `{ }` | `false` | `false` | Scatter fills full width |
| `false` | `{ }` | `false` | Bars fill full width |
| `false` | `false` | `true` | Map fills full width |

Views that were visible in a previous stage fade out smoothly when hidden.

### Available variables

These are the numeric columns in the dataset. Use them as `xVar` or `yVar` values.

| Variable name | Description |
|---------------|-------------|
| `median_income` | Median household income ($) |
| `median_rent` | Median monthly rent ($) |
| `median_home_price` | Median home price ($) |
| `population` | City population |
| `rent_burden` | Rent as a fraction of income (0–1) |
| `home_price_to_income_ratio` | Home price / income |
| `years_to_twenty_percent_down_payment` | Years to save 20% down payment |

The scatterplot encodes two variables (`xVar` and `yVar`). The bar chart ranks all cities by one variable (`xVar`).

### Available cities

Use these exact strings in `highlightedCities` and map annotation `city` fields:

Atlanta, Austin, Boston, Cambridge, Chicago, Cleveland, Columbus, Dallas, Denver, Detroit, Houston, Jersey City, Los Angeles, Madison, Miami, Milwaukee, Minneapolis, Nashville, New York, Newark, Oakland, Orlando, Philadelphia, Phoenix, Pittsburgh, Portland, Sacramento, San Antonio, San Diego, San Francisco, San Jose, Seattle, Somerville, St Paul

### Annotations

The `annotations` field is an object with optional keys for each component. Omit a key (or set it to `null`) when that component has no annotation for the stage.

#### Scatterplot annotations

An array of line segments with text labels. Coordinates are in data units (matching the current `xVar`/`yVar`).

```js
scatter: [
  {
    x1: 60000, y1: 0.23,    // line start (data coordinates)
    x2: 120000, y2: 0.28,   // line end (data coordinates)
    text: "Typical range",   // label text
    direction: "SE"          // label placement relative to the endpoint
  }
]
```

#### Bar chart annotations

A single threshold annotation. Draws an L-shaped shaded region that captures both the threshold on the x-axis and the set of cities that exceed it on the y-axis, creating a "leaderboard" effect.

```js
bars: {
  threshold: 0.28,        // value on the x-axis
  direction: "above",     // "above" = highlight cities exceeding threshold
                          // "below" = highlight cities below threshold
  text: "High rent burden"
}
```

#### Map annotations

An array of text labels anchored to specific cities.

```js
map: [
  { city: "Seattle", text: "Tech hub", direction: "E" },
  { city: "Denver",  text: "Rising costs", direction: "SE" }
]
```

#### Direction values

The `direction` field controls where a text label is placed relative to its anchor point. It accepts cardinal and intercardinal directions:

```
         N
    NW       NE
  W    (point)   E
    SW       SE
         S
```

Labels near the edge of the SVG are automatically repositioned to stay visible.

## Example: the default story

The included `story.js` walks through US housing affordability in six stages:

| # | id | Layout | What it shows |
|---|-----|--------|--------------|
| 0 | intro | full | Overview — income vs. rent, income ranking, geographic spread |
| 1 | rent_burden | scatter + bar | Rent burden vs. income, with threshold at 0.28 |
| 2 | price_to_income | scatter only | Price-to-income ratio with 6x reference line |
| 3 | down_payment | bar only | Years to save for a down payment, threshold at 15 years |
| 4 | geography | map + bar | Home prices by geography, labels on highlighted cities |
| 5 | closing | map only | Reflective ending — no annotations |

## Project structure

```
src/
  App.svelte              # Layout, scroll observer, data loading
  stories/story.js        # Stage definitions — the file you edit
  components/
    Scatterplot.svelte     # D3 enter/update/exit scatterplot
    BarChart.svelte        # D3 enter/update/exit horizontal bar chart
    CityMap.svelte         # US map with city dots (Albers USA projection)
public/
  housing-demo-data.csv   # 34 US cities with income, rent, home price, and derived metrics
  states-10m.json         # US state boundaries (TopoJSON)
```

## Key techniques demonstrated

- **Scrollytelling with IntersectionObserver** — no library needed; a Svelte `use:` action wires up the observer
- **Declarative story authoring** — the story file acts as a configuration interface; narrative choices (staging, emphasis, annotation) are separated from rendering code
- **D3 enter/update/exit inside Svelte** — the scatterplot and bar chart use `d3.selection.join()` for animated data joins within `bind:this` refs, while Svelte handles reactivity
- **Annotation system** — per-stage annotations (line segments, threshold regions, city labels) are driven entirely from the story file with automatic edge-clipping detection
- **Adaptive layouts** — the dashboard computes slot positions from the `views` config, and inactive views fade out with CSS transitions
