// Scene map: which source frames play during each section, and how much
// scroll each section gets. Frame numbers are the ORIGINAL render numbering
// (0–850, 50fps); the loader converts them to the decimated set.
//
// Tune these with the dev HUD (append ?hud=1 to the URL, or press "h").

export type SceneId =
  | "hero"
  | "freeze"
  | "tinted"
  | "tinted-product"
  | "applicator"
  | "lightweight"
  | "strong"
  | "blends"
  | "badges"
  | "invincible"
  | "stays"
  | "back"
  | "court"
  | "uv";

export interface Scene {
  id: SceneId;
  /** [first, last] source frame shown while this section is on screen. */
  frames: [number, number];
  /** Scroll length in viewport heights. 1 = one screen of scrolling. */
  scroll: number;
  /** Fraction of the section over which its copy fades in (default 0.18). */
  fadeIn?: number;
  /** Fraction of the section over which its copy fades out (default 0.18). */
  fadeOut?: number;
}

export const SCENES: Scene[] = [
  // Design v2: the hero opens on frame 10, where only the tips of the shadow
  // hand show (~91% down), and it rises as you scroll. The gradient stays
  // fully dark until 70% of the way through so the bright sky isn't revealed
  // early. This replaces the separate shadow section.
  { id: "hero", frames: [10, 55], scroll: 1.8, fadeIn: 0, fadeOut: 0.3 },
  { id: "freeze", frames: [55, 100], scroll: 1 },
  // Source frames 101–135 are skipped: 104–116 are empty sky (the hand has
  // left, the face hasn't arrived) and 128–132 a blurred skin whip. Scrubbed,
  // they read as a blue then a brown flash, so the edit cuts hand → face.
  { id: "tinted", frames: [136, 225], scroll: 1.6 },
  { id: "tinted-product", frames: [225, 300], scroll: 1.2 },
  { id: "applicator", frames: [300, 355], scroll: 1 },
  { id: "lightweight", frames: [355, 395], scroll: 1 },
  { id: "strong", frames: [395, 450], scroll: 1.2 },
  { id: "blends", frames: [450, 490], scroll: 1 },
  { id: "badges", frames: [490, 515], scroll: 1 },
  { id: "invincible", frames: [515, 540], scroll: 1 },
  { id: "stays", frames: [540, 610], scroll: 1.2 },
  { id: "back", frames: [610, 700], scroll: 1.4 },
  { id: "court", frames: [700, 790], scroll: 1.2 },
  { id: "uv", frames: [790, 850], scroll: 1.2 },
];

const DEFAULT_FADE = 0.18;

/** Cumulative scroll offsets (in vh units) for each scene start. */
export const SCENE_OFFSETS: number[] = SCENES.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].scroll);
  return acc;
}, []);

export const TOTAL_SCROLL = SCENES.reduce((sum, s) => sum + s.scroll, 0);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

export function sceneIndexAt(scrollVh: number): number {
  for (let i = SCENES.length - 1; i >= 0; i--) {
    if (scrollVh >= SCENE_OFFSETS[i]) return i;
  }
  return 0;
}

/** Local progress (0–1) of scene `i` at the given scroll position. Unclamped. */
export function localProgress(i: number, scrollVh: number): number {
  return (scrollVh - SCENE_OFFSETS[i]) / SCENES[i].scroll;
}

/** Source frame (fractional) for a scroll position. */
export function sourceFrameAt(scrollVh: number): number {
  const i = sceneIndexAt(scrollVh);
  const [a, b] = SCENES[i].frames;
  return a + clamp01(localProgress(i, scrollVh)) * (b - a);
}

/** Opacity (0–1) and a reveal value (0 = entering, 1 = settled) for scene `i`'s overlay. */
export function overlayState(i: number, scrollVh: number): { opacity: number; reveal: number } {
  const scene = SCENES[i];
  const local = localProgress(i, scrollVh);

  if (local < 0 || local > 1) return { opacity: 0, reveal: local < 0 ? 0 : 1 };
  const fadeIn = scene.fadeIn ?? DEFAULT_FADE;
  const fadeOut = scene.fadeOut ?? DEFAULT_FADE;
  const entering = fadeIn > 0 ? clamp01(local / fadeIn) : 1;
  const leaving = fadeOut > 0 ? clamp01((1 - local) / fadeOut) : 1;
  return { opacity: smooth(Math.min(entering, leaving)), reveal: smooth(entering) };
}
