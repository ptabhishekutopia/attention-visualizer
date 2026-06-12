# Attention Visualizer

Attention Visualizer is an educational app that explains Transformer self-attention with interactive visualizations. It runs entirely in the browser with Transformers.js.
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
