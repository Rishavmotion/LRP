"use client";

import { useEffect, useRef } from "react";
import {
  SCENES,
  TOTAL_SCROLL,
  localProgress,
  overlayState,
  sceneIndexAt,
  sourceFrameAt,
} from "@/lib/scenes";
import { FrameStore, MANIFEST, type Manifest } from "@/lib/frameLoader";
import { pickTier } from "@/lib/tier";
import { sceneOverlay } from "./overlays/sceneOverlays";
import { ScrollArrow } from "./Icons";
import s from "./Stage.module.css";

const MAX_DPR = 2;
/** Seconds for the scrub to catch up with the scroll position (a little inertia on top of Lenis). */
const EASE = 0.08;
/** Frames past the hero's scrub that load up front, so the first scroll never waits. */
const HERO_LOOKAHEAD = 6;
/**
 * If the exact frame isn't loaded, draw one at most this far away (±6 frames
 * ≈ 0.24 s of footage); otherwise keep the current image until it arrives.
 */
const FALLBACK_DISTANCE = 6;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, w, h);
}

export default function Stage() {
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cueRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const manifest: Manifest = MANIFEST;
    const root = document.documentElement;
    let store: FrameStore | null = null;
    let unlocked = false;
    let lastDrawn = -1;
    let dpr = 1;
    let width = 0;
    let height = 0;

    // Stage geometry, measured by ResizeObserver so scroll handling never
    // reads layout.
    let stageTop = 0;
    let stageRange = 1;

    // Scroll progress (0–1): `target` follows the scroll position, `current`
    // eases toward it in the rAF loop.
    let target = 0;
    let current = 0;
    let dirty = true;

    const toIndex = (sourceFrame: number) =>
      Math.min(manifest.count - 1, Math.max(0, Math.round(sourceFrame / manifest.step)));
    const heroBand: [number, number] = [
      toIndex(SCENES[0].frames[0]),
      toIndex(SCENES[0].frames[1]) + HERO_LOOKAHEAD,
    ];
    const heroEnd = SCENES[0].scroll / TOTAL_SCROLL;

    const hud = hudRef.current;
    const hudOn =
      new URLSearchParams(window.location.search).has("hud") ||
      window.localStorage.getItem("lrp-hud") === "1";
    if (hud) hud.dataset.on = hudOn ? "1" : "0";

    // ---- render loop: runs only while something is changing -------------

    let raf = 0;
    let lastTime = 0;
    const kick = () => {
      if (raf) return;
      lastTime = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      const diff = target - current;
      if (Math.abs(diff) > 0.00005) {
        current += diff * (1 - Math.exp(-dt / EASE));
        dirty = true;
      } else if (current !== target) {
        current = target;
        dirty = true;
      }
      if (dirty) {
        dirty = false;
        update(current);
      }
      if (current !== target) raf = requestAnimationFrame(tick);
    };

    // ---- canvas -----------------------------------------------------------

    const applySize = () => {
      if (!width || !height) return;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const set = store ? manifest.sets[store.set] : null;
      if (set) {
        // Never render more pixels than the frame has: with cover-fit, one CSS
        // pixel holds this many frame pixels. Upscaling past it costs fill
        // rate on every scroll tick and adds no detail.
        const framePxPerCss = 1 / Math.max(width / set.width, height / set.height);
        dpr = Math.max(1, Math.min(dpr, framePxPerCss));
      }
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastDrawn = -1;
      dirty = true;
      kick();
    };

    const draw = (index: number) => {
      if (!store || !width) return;
      const i = store.nearest(index, FALLBACK_DISTANCE);
      if (i < 0 || i === lastDrawn) return;
      const img = store.frames[i];
      if (!img) return;
      drawCover(ctx, img, width, height);
      lastDrawn = i;
    };

    // ---- frames -----------------------------------------------------------

    const setLoading = () => {
      if (!store) return;
      const bar = loadingBarRef.current;
      if (bar) bar.style.width = `${Math.min(1, store.loadedCount / store.initialCount) * 100}%`;
      if (loadingRef.current && store.ready(heroBand[0], heroBand[1])) {
        loadingRef.current.dataset.done = "1";
      }
    };

    const buildStore = () => {
      const set = pickTier();
      if (store?.set === set) return;
      store?.destroy();
      store = new FrameStore(set, manifest.count, { band: heroBand, concurrency: 6 });
      store.onProgress = setLoading;
      store.onFrame = () => {
        dirty = true;
        kick();
      };
      lastDrawn = -1;
      store.start();
      if (unlocked) store.unlock();
      dirty = true;
    };

    // The full sequence loads only once the visitor shows intent to scroll.
    const INTENT_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      store?.unlock();
      for (const ev of INTENT_EVENTS) window.removeEventListener(ev, unlock);
    };
    for (const ev of INTENT_EVENTS) window.addEventListener(ev, unlock, { passive: true });

    // ---- per-frame update -------------------------------------------------

    const update = (p: number) => {
      const scrollVh = p * TOTAL_SCROLL;
      const sceneIndex = sceneIndexAt(scrollVh);
      const sourceFrame = sourceFrameAt(scrollVh);
      const index = toIndex(sourceFrame);

      draw(index);
      store?.focus(index);

      for (let i = 0; i < SCENES.length; i++) {
        const el = overlayRefs.current[i];
        if (!el) continue;
        const { opacity, reveal } = overlayState(i, scrollVh);
        el.style.opacity = opacity.toFixed(3);
        el.style.setProperty("--reveal", reveal.toFixed(3));
        const visible = opacity > 0.001;
        if (el.dataset.visible !== String(visible)) el.dataset.visible = String(visible);
      }

      // Design v2: the cue belongs to the hero only, and leaves with its copy.
      if (cueRef.current) cueRef.current.style.opacity = overlayState(0, scrollVh).opacity.toFixed(3);

      if (hud && hud.dataset.on === "1") {
        const scene = SCENES[sceneIndex];
        const local = clamp01(localProgress(sceneIndex, scrollVh));
        hud.textContent =
          `scene ${sceneIndex + 1}/${SCENES.length} · ${scene.id}  ` +
          `local ${(local * 100).toFixed(0)}%\n` +
          `frame src ${sourceFrame.toFixed(0)} · set #${index}` +
          (lastDrawn !== index ? ` (drawn #${lastDrawn})` : "") +
          `\nloaded ${store?.loadedCount ?? 0}/${manifest.count} · ${store?.set ?? ""}` +
          (unlocked ? "" : " · waiting for scroll");
      }
    };

    // ---- scroll -----------------------------------------------------------

    // Nav behaviour: solid with its border on the hero, hidden while scrolling
    // down through the story, back on any scroll up.
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      target = clamp01((y - stageTop) / stageRange);
      const onHero = target < heroEnd;
      root.dataset.hero = onHero ? "1" : "0";
      if (y !== lastY) root.dataset.nav = onHero || y < lastY ? "show" : "hide";
      lastY = y;
      if (y > 0) unlock();
      kick();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === canvas) {
          width = entry.contentRect.width;
          height = entry.contentRect.height;
          applySize();
        } else {
          stageTop = stage.offsetTop;
          stageRange = Math.max(1, stage.offsetHeight - window.innerHeight);
          onScroll();
        }
      }
    });
    ro.observe(canvas);
    ro.observe(stage);

    // Resize also fires when the window moves to a screen with a different
    // pixel ratio, so it covers every input to the tier choice.
    const onResize = () => {
      buildStore();
      applySize();
    };
    window.addEventListener("resize", onResize);

    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "h" || !hud) return;
      const on = hud.dataset.on === "1" ? "0" : "1";
      hud.dataset.on = on;
      window.localStorage.setItem("lrp-hud", on);
      if (on === "0") hud.textContent = "";
      dirty = true;
      kick();
    };
    window.addEventListener("keydown", onKey);

    root.dataset.hero = "1";
    root.dataset.nav = "show";
    buildStore();
    kick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      for (const ev of INTENT_EVENTS) window.removeEventListener(ev, unlock);
      store?.destroy();
      delete root.dataset.hero;
      delete root.dataset.nav;
    };
  }, []);

  // The sticky viewport occupies one screen, so TOTAL_SCROLL screens of
  // scrolling need TOTAL_SCROLL + 1 screens of height.
  return (
    <section
      ref={stageRef}
      className={s.stage}
      style={{ height: `calc(${TOTAL_SCROLL + 1} * 100svh)` }}
      aria-label="Anthelios story"
    >
      <div className={s.sticky}>
        <canvas ref={canvasRef} className={s.canvas} aria-hidden="true" />

        {SCENES.map((scene, i) => (
          <div
            key={scene.id}
            ref={(el) => {
              overlayRefs.current[i] = el;
            }}
            className={s.overlay}
            data-scene={scene.id}
            data-visible={i === 0 ? "true" : "false"}
            style={i === 0 ? { opacity: 1 } : undefined}
          >
            {sceneOverlay(scene.id)}
          </div>
        ))}

        <div ref={cueRef} className={s.cue} aria-hidden="true">
          <span>Scroll to explore</span>
          <ScrollArrow />
        </div>

        <div ref={loadingRef} className={s.loading} role="progressbar" aria-label="Loading">
          <div ref={loadingBarRef} className={s.loadingBar} />
        </div>

        <div ref={hudRef} className={s.hud} aria-hidden="true" />
      </div>
    </section>
  );
}
