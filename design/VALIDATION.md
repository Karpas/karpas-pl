# Redesign validation

## Automated

- Studio production graphics bundle builds with esbuild.
- Calculator production build and static export complete successfully.
- 10 Node tests pass: original default/bulk/add-on pricing; four-PLN price floor;
  invalid dimensions and quantities; ASCII and binary STL volume, dimensions and
  preview vertices; malformed STL rejection; WebGL fallback lifecycle.
- `git diff --check` passes in both repositories.

## Browser checks

- Desktop at 1280 px and mobile at 390 and 320 px: no horizontal overflow.
- Main page: menu open/close, Escape, chapter navigation, interactive shape toggle,
  material selection, local cross-site links, and animation pause.
- Paused hero screenshots taken at separate frames are byte-identical.
- Mobile story scene was reframed after visual inspection to avoid caption overlap.
- Calculator: actual binary STL upload shows the cube with dimensions 10×10×10 mm;
  estimate 24.26 PLN. Invalid file suppresses the quote; removing it restores it.
- Live combination: 100 pieces, PETG and NFC gives 780.16 PLN. Invalid zero quantity
  shows an inline error and suppresses the actionable quote.
- Model rotation, color selection, cost breakdown, and copy-quote confirmation work.
- Local fonts load; runtime browser error logs are empty in the reviewed pages.

## Scope

No production deployment was performed. Preview forms are illustrative; uploaded
STL geometry is rendered from the actual file. Final prices remain estimates.
Reduced-motion behavior is implemented; the operating-system preference was not
changed during testing. The explicit animation pause was verified in the browser.
