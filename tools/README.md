# Asset pipeline

One-off Python scripts that turn the raw design files in `Martin logistics
Assets/` into the optimised WebP and JSON that `public/assets/` serves. They are
not part of `next build` — run them by hand when a source file changes, then
commit the regenerated output.

Everything here resolves paths from the repo root, so run them from anywhere:

```bash
python tools/prep_assets.py
```

## Requirements

Pillow is the only dependency:

```bash
pip install Pillow
```

## Scripts

| Script | Reads | Writes |
| --- | --- | --- |
| `prep_assets.py` | `hero video scroll/*.jpg`, white logo lockup | `public/assets/seq/f000–f119.webp`, `public/assets/img/logo-light*.png` |
| `hero_truck.py` | `twyfod truck.png` | `public/assets/img/hero-truck.{png,webp}`, `hero-truck-shadow.webp` |
| `map_dots.py` | `africa map.jpg` | `public/assets/africa-dots.json` |

### `prep_assets.py`

Downsamples the ~300 source frames to 120 at 1152px wide and encodes them as
WebP. That count is smooth under scroll scrubbing and replaces what used to be a
12.5 MB mp4. Also trims the logo to its artwork and cuts the wordmark bar out of
the full lockup, which reads better at nav size.

**Deletes and recreates `public/assets/seq/` on every run.** The frame count is
mirrored in `components/home/Reel.tsx` — change `TARGET_FRAMES` here and the
`count` passed to `useFrameSequence` there together, or the tail of the scroll
will hold on the last decoded frame.

### `hero_truck.py`

Flood-fills inward from the border so the white bodywork survives the cutout,
then generates a soft contact shadow from the silhouette's footprint so the
truck has weight on the ground instead of floating.

### `map_dots.py`

Samples the continent silhouette on a grid into the dot field behind the network
map. The source jpg is cropped to Africa's bounding box, so pixel position maps
linearly onto geographic coordinates — that is what lets the city markers land
in the right place from lon/lat alone. Also writes `tools/_mapcheck.png` (gitignored)
so dot density and city placement can be eyeballed after a change.
