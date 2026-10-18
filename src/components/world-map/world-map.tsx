"use client";

import { useState } from "react";
import { countryName } from "@/lib/user-agent";
import map from "./paths.json";

/**
 * World map with the given countries shaded by their value (ISO alpha-2 code -> number).
 * The paths come from scripts/build-world-map.mjs, so no map library runs in the browser.
 */
export function WorldMap({ values, locale, unit }: { values: Record<string, number>; locale: string; unit: (count: number) => string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const max = Math.max(1, ...Object.values(values));

  return (
    <div className="relative">
      <svg viewBox={map.viewBox} className="h-auto w-full" role="img" aria-label="World map">
        {map.countries.map(({ code, d }) => {
          const count = values[code] ?? 0;
          return (
            <path
              key={code}
              d={d}
              className={count ? "stroke-background/60" : "fill-muted stroke-background"}
              strokeWidth={0.5}
              style={count ? { fill: "var(--primary)", fillOpacity: 0.3 + (0.7 * count) / max } : undefined}
              onMouseEnter={() => setHovered(code)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </svg>
      {hovered && (
        <div className="pointer-events-none absolute top-2 left-2 rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md">
          <span className="font-medium">{countryName(hovered, locale)}</span>
          {values[hovered] ? <span className="text-muted-foreground"> · {unit(values[hovered])}</span> : null}
        </div>
      )}
    </div>
  );
}
