// Builds src/components/world-map/paths.json: one SVG path per country, keyed by ISO 3166 alpha-2 code.
// The dashboard draws that file directly, so the browser needs no map library. Only rerun it to change the map.
//   npm run build:world-map
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const iso = require("iso-3166-1");
const topology = JSON.parse(readFileSync("node_modules/world-atlas/countries-110m.json", "utf8"));

const width = 960;
const projection = geoNaturalEarth1().fitWidth(width, { type: "Sphere" });
const path = geoPath(projection).digits(1);
const [[, , ], [, height]] = path.bounds({ type: "Sphere" });

const numericToAlpha2 = new Map(iso.all().map((c) => [Number(c.numeric), c.alpha2]));
const byName = { Kosovo: "XK" }; // has no numeric code in the map data

const countries = [];
for (const f of feature(topology, topology.objects.countries).features) {
  const code = numericToAlpha2.get(Number(f.id)) ?? byName[f.properties.name];
  const d = path(f);
  if (code && d) countries.push({ code, d });
}

writeFileSync("src/components/world-map/paths.json", JSON.stringify({ viewBox: `0 0 ${width} ${Math.ceil(height)}`, countries }));
console.log(`${countries.length} countries`);
