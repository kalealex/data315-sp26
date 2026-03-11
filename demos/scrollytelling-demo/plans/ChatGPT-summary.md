# Scrollytelling Housing Affordability Demo

## Technical Specification (Svelte + D3)

---

## Purpose

Implement a reusable, classroom‑ready scrollytelling demo that teaches **data storytelling orchestration**, not low‑level implementation. The system must support:

* Multiple coordinated views (scatterplot, bar chart, map)
* Narrative staging via scroll
* Axis substitution with animated transitions
* Highlighting specific cities across all views
* Clear separation between **story configuration** and **visual implementation**

This demo is designed for live instruction and participatory editing.

---

## Technology Stack

* **Svelte** — component structure, reactivity, lifecycle
* **D3.js** — scales, axes, transitions, projections
* **No external scrollytelling libraries** (e.g., Scrollama)
* Browser‑native `IntersectionObserver` for scroll → stage mapping

---

## High‑Level Architecture

```
App.svelte
│
├── stories/
│   └── story.js           # Declarative narrative stages
│
├── components/
│   ├── Scatterplot.svelte # Axis‑swappable scatterplot
│   ├── BarChart.svelte    # Leaderboard bar chart w/ animated resorting
│   └── CityMap.svelte     # Map w/ city dots + highlighting
│
├── data/
│   ├── housing_demo_data.csv
│   └── us-states.geojson
```

---

## Core Design Principles (Do Not Violate)

1. **Declarative orchestration, imperative rendering**

   * Story stages declare *what* should change
   * Components imperatively animate *how* they change

2. **Single source of truth for narrative**

   * All stage logic lives in `story.js`
   * No narrative logic inside chart components

3. **Svelte handles reactivity, D3 handles motion**

   * Do **not** replace D3 transitions with CSS‑only animation
   * Use D3 enter/update/exit where sequencing matters

4. **Tabular data flows everywhere**

   * Structural data (GeoJSON) only flows to the map

---

## Dataset Specification

### File: `housing_demo_data.csv`

Each row represents **one city**.

### Required Columns

```
city_name
state
region

median_income
median_rent
median_home_price
population
latitude
longitude

rent_burden
home_price_to_income_ratio
years_to_twenty_percent_down_payment
```

### Derived Variable Definitions

* `rent_burden = (median_rent * 12) / median_income`
* `home_price_to_income_ratio = median_home_price / median_income`
* `years_to_twenty_percent_down_payment = (0.2 * median_home_price) / (0.1 * median_income)`

> All numeric columns **must be parsed as numbers** at load time.

---

## Story Configuration (`stories/story.js`)

### Responsibility

Defines the **entire narrative** as a sequence of stage objects.

### Stage Object Schema

```js
{
  id: string,

  copy: string, // HTML allowed

  views: {
    scatter: false | { xVar: string, yVar: string },
    bars: false | { xVar: string },
    map: boolean
  },

  highlightedCities: string[], // city_name values

  annotations: [] // reserved for later, not yet implemented
}
```

### Constraints

* Maximum **7 stages**
* Variable names must match CSV columns exactly
* No logic inside stages — configuration only

---

## App.svelte

### Responsibilities

* Load datasets
* Track current stage index
* Wire scroll → stage updates
* Pass props to views
* Manage layout layers

### Data Loading

```js
onMount(async () => {
  cities = await d3.csv("housing_demo_data.csv", d => ({ ... }));
  usStates = await d3.json("us-states.geojson");
});
```

### Scroll Handling

* Use `IntersectionObserver`
* Each `.step` section maps to a stage index
* When a step enters viewport → update `stageIndex`

### Layout (Critical)

#### Layered, not columnar

* **Dashboard**: fixed, full‑screen, background layer
* **Text**: scrolling foreground layer

```css
.dashboard {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.text {
  position: relative;
  z-index: 1;
}
```

> The dashboard must **not** affect document flow.

---

## Scatterplot.svelte

### Purpose

Show relationships between two quantitative variables with animated axis substitution.

### Props

```js
data: array
xVar: string
yVar: string
highlightedCities: string[]
```

### Behavior

* X and Y axes are fully swappable
* When either variable changes:

  * Scales recompute
  * Axes transition
  * Points animate to new positions
* Highlighted cities render in a distinct color

### Implementation Pattern

* Reactive `$:` scales
* D3 transitions for:

  * Axes
  * Point positions
* No brushing or filtering

---

## BarChart.svelte (Leaderboard)

### Purpose

Rank cities by a selected quantitative variable.

### Visual Encoding

* **Y‑axis**: city names (categorical)
* **X‑axis**: selected quantitative variable
* Sorted descending (leaderboard metaphor)

### Props

```js
data: array
xVar: string
highlightedCities: string[]
```

### Critical Requirements

* True **enter / update / exit** pattern
* **Staggered animation** based on *new sorted order*
* Axis replacement without overpainting
* Y‑axis labels must always be visible

### Lifecycle Pattern (Required)

* `onMount`: initial render (no axis fade)
* `afterUpdate`: animated updates
* Guard all renders until:

  * data loaded
  * DOM refs bound
  * `xVar` defined

### Do NOT

* Use CSS‑only transitions
* Aggregate by region
* Let axes stack on top of each other

---

## CityMap.svelte (Future Step)

### Purpose

Provide geographic context, not primary analysis.

### Props

```js
data: array
geojson: object
highlightedCities: string[]
```

### Behavior

* State outlines as background
* City dots positioned by lat/lon
* Dot size encodes population
* Highlighted cities rendered distinctly

### Constraints

* No interaction
* No map projection switching
* Map is subordinate to other views

---

## Annotation System (Deferred by Design)

* Annotations will be **view‑specific**, not global
* Stage objects already reserve an `annotations` field
* Annotations should reference **semantic targets** (e.g., city_name, threshold), not pixel coordinates
* Coordinate resolution belongs inside each chart

> Do not implement annotations until all views + transitions are stable.

---

## Development Order (Strict)

1. App wiring + scroll → stage
2. Scatterplot (axis swaps)
3. Bar chart (leaderboard w/ animation)
4. City map
5. Annotations
6. Polish / pacing

---

## Pedagogical Intent

This system is explicitly designed to:

* Emphasize **narrative control over implementation detail**
* Make axis substitution and staging *visible*
* Support live, participatory editing
* Model **responsible AI‑assisted development**

Avoid refactors that:

* Introduce complex state management
* Hide logic behind abstractions
* Optimize prematurely
