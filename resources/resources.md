# DATA 31500 Resources

Here are references and resources for the course separated by topic. 
This is where we will share links to tutorials, examples, and programming tools.


## Computational notebooks

- Welcome to [Google Colab](https://colab.research.google.com/drive/16pBJQePbqkz3QFV54L4NIkOn1kwpuRrj#scrollTo=u1wdmFKqylSI)
- Using [Google Colab with GitHub](https://colab.research.google.com/github/googlecolab/colabtools/blob/master/notebooks/colab-github-demo.ipynb)
- UChicago CS guide to [setting up VS Code](https://uchicago-cs.github.io/student-resource-guide/vscode/about.html).
- Check out [RStudio](https://posit.co/download/rstudio-desktop/) as an alternative IDE for R if you don't want to use VS Code or Colab. See also [Positron](https://github.com/posit-dev/positron?tab=readme-ov-file), and experimental VS Code clone from R's parent company.

## Data wrangling and modeling tools (in Python)

- Basic [pandas tutor](https://pandastutor.com/) demonstrating common dataframe operations
- [Intro to pandas](https://colab.research.google.com/notebooks/mlcc/intro_to_pandas.ipynb#scrollTo=JndnmDMp66FL) in Google Colab
- The [PyMC](https://www.pymc.io/welcome.html) and [arviz](https://python.arviz.org/en/stable/examples/index.html) APIs for Bayesian statistics workflows in Python.
- [Scikit-learn](https://scikit-learn.org/stable/) Python module for ML
- Microsoft's open source Python module for ML interpretability, [interpret](https://github.com/interpretml/interpret/)

## Data wrangling and modeling tools (in R)

-[dplyr](https://dplyr.tidyverse.org/) is a wonderful tool for data manipulation in R, best coupled with other tools in the broader [tidyverse](https://www.tidyverse.org/packages/)
- [brms](https://paulbuerkner.com/brms/) or Bayesian Regression Models is my preferred modeling tool in R. It has excellent support for a wide variety of regression models, including bespoke specifications such as censored models and mixtures. Sampling from posterior distributions and visualizing them provides a flexible way to query model results.

## Visualization APIs

- Altair is a wonderful vis API for Python. Check out their [user guide](https://altair-viz.github.io/user_guide/data.html), [example gallery](https://altair-viz.github.io/gallery/index.html), [API](https://altair-viz.github.io/user_guide/API.html), and more on the same website! 
- Altair is actually a wrapper around a JavaScript library called Vega-Lite. If you're interested, check out the [Vega-Lite example gallery](https://vega.github.io/vega-lite/examples/) to compare its syntax with that of Altair.
- [Vega](https://vega.github.io/vega/) and [Vega-Lite](https://vega.github.io/vega-lite/) are declarative grammars for interactive visualization that compile to [D3](https://d3js.org/) visualizations. Altair leverages this software stack by wrapping python syntax around Vega-Lite. 
- We will use [D3](https://d3js.org/) directly in this course, in addition to other tools, because it's lower level of abstraction is idea for implementing bespoke animations and interactive data interfaces.
- From the creators of popular visualization toolkits like D3, Vega, and Vega-Lite, the University of Washington Interactive Data Lab has graciously made their [visualization curriculum](https://github.com/uwdata/visualization-curriculum) public! The notebooks posted here give an excellent walkthrough of some topics we'll cover in this course.
- [ggplot](https://ggplot2.tidyverse.org/) is possibly the most flexible and extensible vis API in existence
- Matthew Kay's [ggdist R package](https://mjskay.github.io/ggdist/) for visualizing distributions is build upon ggplot. It's the most expressive tool for rendering uncertainty visualizations hands down.

## Web development

- Brush up on your [HTML](https://www.w3schools.com/tags/default.asp), [CSS](https://www.w3schools.com/css/), and [JavaScript](https://www.w3schools.com/js/) at the start of the quarter. If these are unfamiliar, this class might be difficult.
- [Svelte](https://svelte.dev/) is the primary JavaScript framework we will use in this class. Check out their wonderful [tutorial](https://learn.svelte.dev/) to get started. If you prefer [React](https://react.dev/) or similar, you are welcome to use it.
- We are going to use Svelte with D3 as demonstrated in these [materials from MIT](https://vis-society.github.io/lectures/intro-svelte-d3.html)'s vis curriculum. Check it out to get a head start on the way we are learning web development in this course!
- Importing the [Scrolly](https://svelte.dev/playground/d806d5f6e300426ab4af317d9e1d0cb3?version=3.42.4) Svelte Component is helpful for implementing data stories.

## Demos and videos

- Interactive [scatterplot matrix](https://vega.github.io/vega/examples/brushing-scatter-plots/)
- Hans Rosling's [visualization storytelling](https://www.youtube.com/watch?v=hVimVzgtD6w)
- [Making PDFs Accessible](https://ieeevis.org/year/2024/info/call-participation/make-pdf-accessible)
- Amanda Cox from the New York Times on [uncertainty visualizations in the news](https://www.youtube.com/watch?v=0L1tGo-DvD0) (2:55 – 10:43)
- Fred Hohman's presentations about his work on [ML interpretability](https://fredhohman.com/dissertation/)

## Choosing colors

- An overview of [color schemes](https://observablehq.com/@d3/color-schemes) available in Altair.
- The [ColorBrewer](https://colorbrewer2.org/#type=sequential&scheme=BuGn&n=3) tool for choosing color palettes.
- [Color Buddy](https://color-buddy.netlify.app/)

## Map projections

- An interactive gallery of [map projections](https://observablehq.com/@d3/projection-transitions) available in Altair

## Data stories

- [Idyll](https://idyll-lang.org/gallery) language for interactive data stories.
- Check out more interactive articles on [Distill Pub](https://distill.pub/) and the [Parametric Press](https://parametric.press/issue-02/)

