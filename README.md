# KarPas — studio website

Static Polish-language studio site. GitHub Actions publishes `public/` to GitHub Pages.
The legacy GitLab Pages pipeline also serves `public/`. The custom domain must point
to the selected Pages host; pushing code does not update DNS.
The committed browser bundle keeps deployment independent of a build on the server.

## Build

After changing graphics or interaction scripts:

```sh
npm ci
npm run build
```

This bundles and minifies the renderer and interaction code with esbuild.
HTML, CSS and fonts are served directly.

## Local preview

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory public
```

The companion calculator lives in the separate `3d-calc` repository. Build it with
`npm ci && npm run build`, then serve its `out/` folder on port 8081. On localhost,
links connect the two previews. Published links retain the production domains.

## Design and graphics

- `public/index.html`: content, landmarks and accessible alternatives.
- `public/assets/css/style.css`: responsive layout and motion preferences.
- `public/assets/js/studio.js`: scene orchestration, scroll chapters, material lab,
  mobile navigation, animation pause and local preview links.
- `public/assets/js/form-engine.js`: Three.js renderer, shape morphing, physical
  materials, layered object and sample tag. The calculator carries its own copy
  with package imports so the repositories can deploy independently.
- `public/assets/vendor/`: vendored Three.js 0.187.0 and RoomEnvironment, MIT license
  included. No runtime CDN dependency.
- `public/assets/fonts/`: self-hosted DM Sans and Space Grotesk, Latin and Latin
  Extended subsets, OFL licenses included.

The 3D forms are illustrative, not claims of completed customer work. Graphics
have a CSS fallback when WebGL is unavailable. Offscreen scenes suspend rendering;
paused scenes render only when their state changes. Reduced motion is respected.
