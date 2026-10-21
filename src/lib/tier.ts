// Which frame set a device gets. Each tier is a media query so the same rule
// drives both the <head> preloads (no JS yet) and the loader in Stage.
//
//              non-retina (<1.5x)    retina (≥1.5x)
//   ≤767px     m810                  m810
//   768–1400   d1280                 d1920
//   1401–1599  d1920                 d1920
//   1600–2199  d1920                 d2560
//   ≥2200      d2560                 d2560

export type Tier = "m810" | "d1280" | "d1920" | "d2560";

export const TIER_QUERIES: Record<Tier, string> = {
  m810: "(max-width: 767px)",
  d1280: "(min-width: 768px) and (max-width: 1400px) and (max-resolution: 1.49dppx)",
  d1920:
    "(min-width: 1401px) and (max-width: 2199px) and (max-resolution: 1.49dppx), " +
    "(min-width: 768px) and (max-width: 1599px) and (min-resolution: 1.5dppx)",
  d2560: "(min-width: 1600px) and (min-resolution: 1.5dppx), (min-width: 2200px)",
};

const DOWNGRADE: Record<Tier, Tier> = { m810: "m810", d1280: "d1280", d1920: "d1280", d2560: "d1920" };

/** Frames preloaded from the HTML head so the opening scenes are in flight before JS boots. */
export const PRELOAD_FRAMES = 6;

export const frameUrl = (set: string, index: number) =>
  `/frames/${set}/${String(index).padStart(4, "0")}.webp`;

export function pickTier(): Tier {
  let tier: Tier = "d1920";
  for (const t of Object.keys(TIER_QUERIES) as Tier[]) {
    if (window.matchMedia(TIER_QUERIES[t]).matches) {
      tier = t;
      break;
    }
  }
  // Respect the browser's data-saver setting: one tier down.
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return conn?.saveData ? DOWNGRADE[tier] : tier;
}
