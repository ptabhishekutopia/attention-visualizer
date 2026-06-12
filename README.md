# Attention Visualizer

Attention Visualizer is an educational app that explains Transformer self-attention with interactive visualizations. It runs entirely in the browser with Transformers.js.

## User Guide

### Enter text

Type or paste a sentence into the input box. The included sample sentence is a good starting point if you want to see a clear attention pattern quickly.

### Run the visualization

Click **Visualize attention**. The app tokenizes the text, loads the pretrained BERT model in the browser, and extracts the attention tensors locally.

### Read the heatmap

- Rows show source tokens.
- Columns show target tokens.
- Darker cells mean stronger attention.
- Hover a cell to see the exact value.

### Read the graph

- Each token becomes a node.
- Only stronger connections are shown above the threshold slider.
- Increase the threshold to focus on the strongest relationships.

### Compare layers and heads

- Use the layer selector to switch between transformer layers.
- Use the head selector to compare different attention heads.
- Click a token to inspect its top attended tokens.

### Tips

- Short, grammatical sentences usually produce easier-to-read patterns.
- If the model is still loading, wait for the first run to complete before submitting another sentence.
- Close extra tabs if the browser reports memory issues.

## Features

- React 19 + TypeScript + Vite
- Tailwind CSS styling with a modern glassmorphism layout
- Dark mode-first design with responsive sections
- Transformers.js-powered attention extraction in the browser
- Interactive attention heatmap with hover details and zoom
- D3.js attention graph with threshold-based edges
- Layer and head selectors for BERT attention inspection
- Token inspector with top attended tokens
- Educational explanation cards for beginners
- Zustand state management
- Framer Motion animations

## Screenshots

Add screenshots here after capturing the running app.

- Hero and input section: `./docs/screenshots/hero.png`
- Heatmap visualization: `./docs/screenshots/heatmap.png`
- Attention graph: `./docs/screenshots/graph.png`

## SEO Notes

The app includes page metadata for GitHub Pages, Open Graph and Twitter card tags, plus a generated share image at `public/og-image.svg`.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Open the app in your browser and enter text to visualize attention.

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Deployment to GitHub Pages

This project is configured for GitHub Pages with the Vite base path:

```ts
base: '/attention-visualizer/';
```

### Automatic deployment

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`. When changes are pushed to the `main` branch, the workflow builds the app and deploys the `dist` output to GitHub Pages.

### Manual deployment

You can also deploy with:

```bash
npm run build
npm run deploy
```

## Technology Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- D3.js
- Framer Motion
- Transformers.js

## Notes

- The app is client-side only.
- No backend, database, authentication, or uploads are used.
- The BERT model is loaded lazily and cached in the browser after the first run.
- The footer links to Medium, Instagram, YouTube, and LinkedIn profiles for the creator handle `ptabhishekutopia`.
