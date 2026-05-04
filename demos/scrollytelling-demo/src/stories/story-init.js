// story.js

export const varLabels = {
  median_income: "Median Income",
  median_rent: "Median Rent",
  median_home_price: "Median Home Price",
  affordability_index: "Affordability (don't ask about the units)",
  population: "Population",
  rent_burden: "Rent Burden",
  home_price_to_income_ratio: "Home Price-to-Income Ratio",
  years_to_twenty_percent_down_payment: "Years to Save 20% Down Payment",
  latitude: "Latitude",
  longitude: "Longitude",
};

export const stages = [
  {
    // Layout: "full" (scatter + map + bars)
    id: "intro",
    copy: `
      Housing affordability varies dramatically across U.S. cities.
      Let's explore how income, rent, and home prices interact.
    `,
    views: {
      scatter: {
        xVar: "median_income",
        yVar: "median_rent"
      },
      bars: {
        xVar: "median_income"
      },
      map: true
    },
    highlightedCities: ["Seattle", "Chicago"],
    annotations: {
      scatter: [
        {
          x1: 60000, y1: 1200,
          x2: 130000, y2: 2700,
          text: "Income–rent trend",
          direction: "SE"
        }
      ],
      bars: {
        threshold: 80000,
        direction: "above",
        text: "High-income cities"
      },
      map: [
        { city: "Seattle", text: "Tech hub", direction: "E" },
        { city: "Chicago", text: "Midwest anchor", direction: "SE" }
      ]
    }
  },

  {
    // Layout: "scatter-bar" (scatter + bars, no map)
    id: "rent_burden",
    copy: `
      Median rent increases with income, but not uniformly.
      Some cities experience disproportionate rent burdens.
    `,
    views: {
      scatter: {
        xVar: "median_income",
        yVar: "rent_burden"
      },
      bars: {
        xVar: "rent_burden"
      },
      map: false
    },
    highlightedCities: ["San Francisco", "New York", "Austin"],
    annotations: {
      scatter: [
        {
          x1: 60000, y1: 0.23,
          x2: 120000, y2: 0.28,
          text: "Typical burden range",
          direction: "SE"
        }
      ],
      bars: {
        threshold: 0.28,
        direction: "above",
        text: "High rent burden"
      }
    }
  },

  {
    // Layout: "scatter-only"
    id: "price_to_income",
    copy: `
      The home-price-to-income ratio reveals where ownership
      is most out of reach relative to what people earn.
    `,
    views: {
      scatter: {
        xVar: "median_income",
        yVar: "home_price_to_income_ratio"
      },
      bars: false,
      map: false
    },
    highlightedCities: ["San Jose", "Seattle", "Denver"],
    annotations: {
      scatter: [
        {
          x1: 55000, y1: 6,
          x2: 135000, y2: 6,
          text: "6× income reference",
          direction: "NE"
        }
      ]
    }
  },

  {
    // Layout: "bar-only"
    id: "down_payment",
    copy: `
      Time to save for a down payment varies widely,
      even among cities with similar incomes.
      Which cities require the longest saving period?
    `,
    views: {
      scatter: false,
      bars: {
        xVar: "years_to_twenty_percent_down_payment"
      },
      map: false
    },
    highlightedCities: ["Detroit", "Cleveland", "Pittsburgh"],
    annotations: {
      bars: {
        threshold: 15,
        direction: "above",
        text: "15+ years to save"
      }
    }
  },

  {
    // Layout: "map-bar"
    id: "geography",
    copy: `
      Geography matters. Coastal cities dominate
      the most expensive markets, but affordability
      challenges are spreading inland.
    `,
    views: {
      scatter: false,
      bars: {
        xVar: "median_home_price"
      },
      map: true
    },
    highlightedCities: ["San Francisco", "New York", "Denver", "Nashville"],
    annotations: {
      bars: {
        threshold: 600000,
        direction: "above",
        text: "Above $600K"
      },
      map: [
        { city: "San Francisco", text: "Most expensive", direction: "W" },
        { city: "New York", text: "East coast peak", direction: "NE" },
        { city: "Denver", text: "Rising costs", direction: "SE" },
        { city: "Nashville", text: "Emerging market", direction: "S" }
      ]
    }
  },

  {
    // Layout: "map-only"
    id: "closing",
    copy: `
      Affordability depends on what we choose to measure.
      Different narratives emerge from the same data.
    `,
    views: {
      scatter: false,
      bars: false,
      map: true
    },
    highlightedCities: [],
    annotations: {}
  }
];
