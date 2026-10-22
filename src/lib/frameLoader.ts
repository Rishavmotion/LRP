// Progressive frame loader for the scroll sequence.
//
// Frames are decoded into <img> elements so the browser manages decoded-image
// memory (426 frames as raw ImageBitmaps would be several GB). Two phases:
//   1. on load: the `band` frames in order (the hero's scrub) plus every 32nd
//      frame of the whole story, so a fast scroll always has a nearby frame;
//   2. after `unlock()` (the visitor starts scrolling): the rest, coarse to
//      fine (every 16th, 8th … 1st).
// A visitor who never scrolls downloads ~45 frames, not 426. `focus()`
// re-prioritises frames near the current scroll position.

import manifestJson from "../../public/frames/manifest.json";
import { frameUrl, type Tier } from "./tier";

export type FrameSet = Tier;

export interface Manifest {
  version: string;
  step: number;
  count: number;
  sourceCount: number;
  sets: Record<FrameSet, { width: number; height: number; kind: "landscape" | "portrait" }>;
}

// Bundled at build time rather than fetched: the JS filename is content-hashed,
// so the manifest can never go stale behind the long cache on /frames/*.
export const MANIFEST = manifestJson as Manifest;

function buildPhases(count: number, band: [number, number]): { now: number[]; later: number[] } {
  const seen = new Set<number>();
  const take = (out: number[], i: number) => {
    if (i >= 0 && i < count && !seen.has(i)) {
      seen.add(i);
      out.push(i);
    }
  };
  const now: number[] = [];
  for (let i = band[0]; i <= band[1]; i++) take(now, i);
  for (let i = 0; i < count; i += 32) take(now, i);
  const later: number[] = [];
  for (const stride of [16, 8, 4, 2, 1]) {
    for (let i = 0; i < count; i += stride) take(later, i);
  }
  return { now, later };
}

export class FrameStore {
  readonly frames: (HTMLImageElement | null)[];
  loadedCount = 0;
  onProgress?: (loaded: number, total: number) => void;
  onFrame?: (index: number) => void;

  unlocked = false;
  /** Size of phase 1 — what loads before the visitor scrolls. */
  readonly initialCount: number;
  private pending: number[];
  private deferred: number[];
  private inflight = 0;
  private destroyed = false;
  private readonly concurrency: number;

  constructor(
    readonly set: FrameSet,
    readonly count: number,
    options: { band: [number, number]; concurrency?: number }
  ) {
    this.frames = new Array(count).fill(null);
    const { now, later } = buildPhases(count, options.band);
    this.pending = now;
    this.deferred = later;
    this.initialCount = now.length;
    this.concurrency = options.concurrency ?? 6;
  }

  start() {
    this.pump();
  }

  /** Queue the rest of the sequence. Idempotent. */
  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    this.pending = this.pending.concat(this.deferred);
    this.deferred = [];
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

  /** True once every frame in [from, to] is decoded. */
  ready(from: number, to: number): boolean {
    for (let i = Math.max(0, from); i <= Math.min(to, this.count - 1); i++) if (!this.frames[i]) return false;
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
