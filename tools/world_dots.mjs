/* Build the globe's land dot field.
 *
 * Natural Earth 110m land polygons, sampled onto a roughly equal-area lat/lon
 * grid: each latitude band gets a dot count proportional to cos(lat), so the
 * spacing stays even on the sphere instead of bunching at the poles the way a
 * naive fixed-step grid does.
 *
 * Build-time only. `world-atlas`, `topojson-client` and `d3-geo` are installed
 * with --no-save and never ship — the output is a plain JSON of [lon, lat]
 * pairs, so the site carries no new runtime dependency.
 *
 *   node tools/world_dots.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as topojson from "topojson-client";
import { geoContains } from "d3-geo";

const require = createRequire(import.meta.url);
const topo = JSON.parse(
  readFileSync(require.resolve("world-atlas/land-110m.json"), "utf8"),
);
const land = topojson.feature(topo, topo.objects.land);

// Spacing in degrees at the equator. The section dollies in to ~3x, and at
// that range a 1.6 grid has thinned out into an anonymous dot pattern with no
// coastline left in it — 0.85 keeps Africa legible at the closest framing.
// One decimal place is well under the grid spacing and roughly halves the file.
const STEP = 0.85;
const LAT_LIMIT = 84;

const dots = [];
for (let lat = -LAT_LIMIT; lat <= LAT_LIMIT; lat += STEP) {
  const c = Math.cos((lat * Math.PI) / 180);
  if (c < 0.02) continue;
  const lonStep = STEP / c;
  for (let lon = -180; lon < 180; lon += lonStep) {
    if (geoContains(land, [lon, lat])) {
      dots.push([+lon.toFixed(1), +lat.toFixed(1)]);
    }
  }
}

const out = { step: STEP, dots };
const dest = "public/assets/world-dots.json";
writeFileSync(dest, JSON.stringify(out));
console.log(
  `${dest}  ${dots.length} dots  ${(JSON.stringify(out).length / 1024).toFixed(1)} KB`,
);
