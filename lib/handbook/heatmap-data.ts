/**
 * Shared heatmap data for the HIVE adaptation options matrix.
 * Used by HeatmapPanel on both /handbook (landing) and /handbook/options.
 */

export const HEATMAP_SECTORS = ["Roads", "Rail", "Aviation", "Maritime"] as const;

export type HeatmapSector = (typeof HEATMAP_SECTORS)[number];

export type HeatmapHazard = {
  id: string;
  label: string;
  /** Substrings used to match incoming filter strings to this hazard ID */
  match: string[];
};

export const HEATMAP_HAZARDS: HeatmapHazard[] = [
  { id: "heat",     label: "High Temp",  match: ["heat", "temperature", "thermal"] },
  { id: "rain",     label: "Heavy Rain", match: ["rain", "rainfall", "precipitation"] },
  { id: "flooding", label: "Flooding",   match: ["flood", "surface water", "fluvial", "coastal"] },
  { id: "storms",   label: "Storms",     match: ["storm", "wind", "cyclone"] },
  { id: "sealevel", label: "Sea Level",  match: ["sea level", "coastal", "tidal", "inundation"] },
  { id: "drought",  label: "Drought",    match: ["drought", "dry", "water scarcity"] },
];

export type HeatmapMatrix = Record<HeatmapSector, Record<string, number>>;

export const HEATMAP_MATRIX: HeatmapMatrix = {
  Roads:    { heat: 3, rain: 5, flooding: 5, storms: 3, sealevel: 3, drought: 2 },
  Rail:     { heat: 6, rain: 6, flooding: 4, storms: 1, sealevel: 4, drought: 2 },
  Aviation: { heat: 7, rain: 3, flooding: 4, storms: 5, sealevel: 2, drought: 1 },
  Maritime: { heat: 6, rain: 2, flooding: 3, storms: 6, sealevel: 5, drought: 3 },
};

export const HEATMAP_MAX = 7;

export type CellColors = {
  bg: string;
  text: string;
  border: string;
};

export function getCellColors(
  count: number,
  sectorMatch: boolean,
  hazardMatch: boolean
): CellColors {
  if (count === 0)
    return { bg: "rgba(0,0,0,0.04)", text: "#9ca3af", border: "transparent" };

  const isContextMatch = sectorMatch && hazardMatch;
  const isPartialMatch = sectorMatch || hazardMatch;

  if (isContextMatch) return { bg: "#1d70b8", text: "#fff", border: "#1558a0" };

  const intensity = count / HEATMAP_MAX;

  if (isPartialMatch) {
    return intensity >= 0.7
      ? { bg: "#bbf7d0", text: "#14532d", border: "#86efac" }
      : { bg: "#dcfce7", text: "#065f46", border: "#bbf7d0" };
  }

  if (intensity >= 0.7) return { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" };
  if (intensity >= 0.4) return { bg: "#ecfdf5", text: "#065f46", border: "#d1fae5" };
  return { bg: "#f0fdf4", text: "#86efac", border: "#d1fae5" };
}

/**
 * Normalise an arbitrary array of filter strings (e.g. from search results or
 * URL params) to the heatmap's internal hazard IDs.
 */
export function matchHazardIds(activeHazards: string[]): string[] {
  return HEATMAP_HAZARDS.filter((h) =>
    activeHazards.some((a) =>
      h.match.some((m) => a.toLowerCase().includes(m))
    )
  ).map((h) => h.id);
}

/**
 * Normalise an arbitrary array of sector strings to the heatmap's
 * canonical sector labels.
 */
export function matchSectors(activeSectors: string[]): string[] {
  return HEATMAP_SECTORS.filter((s) =>
    activeSectors.some(
      (a) =>
        s.toLowerCase().includes(a.toLowerCase()) ||
        a.toLowerCase().includes(s.toLowerCase())
    )
  );
}
