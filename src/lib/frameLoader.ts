// Progressive frame loader for the scroll sequence.
//
// Frames are decoded into <img> elements so the browser manages decoded-image
// memory (426 frames as raw ImageBitmaps would be several GB). Load order:
//   1. the first `firstBand` frames in order (hero → first scenes),
//   2. a coarse pass over the whole range (every 32nd, 16th, 8th …),
//   3. everything else.
// `focus()` re-prioritises frames near the current scroll position.

export type FrameSet = "desktop" | "mobile";

export interface Manifest {
  step: number;
  count: number;
  sourceCount: number;
  sets: Record<FrameSet, { width: number; height: number }>;
}

export async function loadManifest(): Promise<Manifest> {
  const res = await fetch("/frames/manifest.json", { cache: "force-cache" });
  if (!res.ok) throw new Error(`manifest: ${res.status}`);
  return res.json();
}

export const frameUrl = (set: FrameSet, index: number) =>
  `/frames/${set}/${String(index).padStart(4, "0")}.webp`;

function buildPriority(count: number, firstBand: number): number[] {
  const order: number[] = [];
  const seen = new Set<number>();
  const push = (i: number) => {
    if (i >= 0 && i < count && !seen.has(i)) {
      seen.add(i);
      order.push(i);
    }
  };
  for (let i = 0; i < firstBand; i++) push(i);
  for (const stride of [32, 16, 8, 4, 2, 1]) {
    for (let i = 0; i < count; i += stride) push(i);
  }
  return order;
}

export class FrameStore {
  readonly frames: (HTMLImageElement | null)[];
  loadedCount = 0;
  onProgress?: (loaded: number, total: number) => void;
  onFrame?: (index: number) => void;

  private pending: number[];
  private inflight = 0;
  private destroyed = false;
  private readonly concurrency: number;

  constructor(
    readonly set: FrameSet,
    readonly count: number,
    options: { firstBand?: number; concurrency?: number } = {}
  ) {
    this.frames = new Array(count).fill(null);
    this.pending = buildPriority(count, options.firstBand ?? 60);
    this.concurrency = options.concurrency ?? 6;
  }

  start() {
    this.pump();
  }

  /** Pull frames near `center` to the front of the queue, nearest first. */
  focus(center: number, radius = 48) {
    if (!this.pending.length) return;
    const near: number[] = [];
    const rest: number[] = [];
    for (const i of this.pending) (Math.abs(i - center) <= radius ? near : rest).push(i);
    near.sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
    this.pending = near.concat(rest);
  }

  /** Index of the nearest loaded frame to `i`, or -1 if nothing is loaded yet. */
  nearest(i: number): number {
    if (this.frames[i]) return i;
    for (let d = 1; d < this.count; d++) {
      if (i - d >= 0 && this.frames[i - d]) return i - d;
      if (i + d < this.count && this.frames[i + d]) return i + d;
    }
    return -1;
  }

  /** True once every frame in [0, upTo) is decoded. */
  ready(upTo: number): boolean {
    for (let i = 0; i < Math.min(upTo, this.count); i++) if (!this.frames[i]) return false;
    return true;
  }

  destroy() {
    this.destroyed = true;
    this.pending = [];
    for (let i = 0; i < this.frames.length; i++) {
      const img = this.frames[i];
      if (img) img.src = "";
      this.frames[i] = null;
    }
  }

  private pump() {
    while (!this.destroyed && this.inflight < this.concurrency && this.pending.length) {
      const i = this.pending.shift()!;
      if (this.frames[i]) continue;
      this.inflight++;
      this.load(i).finally(() => {
        this.inflight--;
        this.pump();
      });
    }
  }

  private async load(i: number, attempt = 0): Promise<void> {
    const img = new Image();
    img.decoding = "async";
    img.src = frameUrl(this.set, i);
    try {
      await img.decode();
    } catch {
      if (this.destroyed) return;
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        return this.load(i, attempt + 1);
      }
      return;
    }
    if (this.destroyed) return;
    this.frames[i] = img;
    this.loadedCount++;
    this.onFrame?.(i);
    this.onProgress?.(this.loadedCount, this.count);
  }
}
