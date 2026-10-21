"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  SCENES,
  TOTAL_SCROLL,
  localProgress,
  overlayState,
  sceneIndexAt,
  sourceFrameAt,
} from "@/lib/scenes";
import { FrameStore, loadManifest, type FrameSet, type Manifest } from "@/lib/frameLoader";
import { sceneOverlay } from "./overlays/sceneOverlays";
import { ScrollArrow } from "./Icons";
import s from "./Stage.module.css";

const MOBILE_QUERY = "(max-width: 767px)";
const MAX_DPR = 2;
/** Frames (decimated index) that must be decoded before the loading bar hides. */
const READY_BAND = 40;
/** Scene index from which the "Scroll to explore" cue is hidden. */
const CUE_HIDE_FROM = SCENES.findIndex((sc) => sc.id === "uv");

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

    let manifest: Manifest | null = null;
    let store: FrameStore | null = null;
    let disposed = false;
    let lastDrawn = -1;
    let dpr = 1;
    let width = 0;
    let height = 0;

    // Scroll progress: ScrollTrigger reports the target, the ticker eases
    // toward it for a little inertia on top of Lenis.
    let target = 0;
    let current = 0;
    let dirty = true;

    const hud = hudRef.current;
    const hudOn =
      new URLSearchParams(window.location.search).has("hud") ||
      window.localStorage.getItem("lrp-hud") === "1";
    if (hud) hud.dataset.on = hudOn ? "1" : "0";

    const currentSet = (): FrameSet =>
      window.matchMedia(MOBILE_QUERY).matches ? "mobile" : "desktop";

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastDrawn = -1;
      dirty = true;
    };

    const draw = (index: number) => {
      if (!store) return;
      const i = store.nearest(index);
      if (i < 0 || i === lastDrawn) return;
      const img = store.frames[i];
      if (!img) return;
      drawCover(ctx, img, width, height);
      lastDrawn = i;
    };

    const toIndex = (sourceFrame: number) => {
      if (!manifest) return 0;
      return Math.min(manifest.count - 1, Math.max(0, Math.round(sourceFrame / manifest.step)));
    };

    const setLoading = (loaded: number, total: number) => {
      const bar = loadingBarRef.current;
      if (bar) bar.style.width = `${(loaded / total) * 100}%`;
      if (loadingRef.current && store?.ready(READY_BAND)) {
        loadingRef.current.dataset.done = "1";
      }
    };

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

      if (cueRef.current) {
        cueRef.current.style.opacity = sceneIndex < CUE_HIDE_FROM ? "1" : "0";
      }

      if (hud && hud.dataset.on === "1") {
        const scene = SCENES[sceneIndex];
        const local = Math.min(1, Math.max(0, localProgress(sceneIndex, scrollVh)));
        hud.textContent =
          `scene ${sceneIndex + 1}/${SCENES.length} · ${scene.id}  ` +
          `local ${(local * 100).toFixed(0)}%\n` +
          `frame src ${sourceFrame.toFixed(0)} · set #${index}` +
          (lastDrawn !== index ? ` (drawn #${lastDrawn})` : "") +
          `\nloaded ${store?.loadedCount ?? 0}/${manifest?.count ?? 0} · ${store?.set ?? ""}`;
      }
    };

    const buildStore = () => {
      if (!manifest) return;
      const set = currentSet();
      if (store?.set === set) return;
      store?.destroy();
      store = new FrameStore(set, manifest.count, { firstBand: 60, concurrency: 6 });
      store.onProgress = setLoading;
      store.onFrame = () => {
        dirty = true;
      };
      lastDrawn = -1;
      store.start();
      dirty = true;
    };

    // Nav behaviour: solid with its border on the hero, hidden while scrolling
    // down through the story, back on any scroll up.
    const root = document.documentElement;
    const heroEnd = SCENES[0].scroll / TOTAL_SCROLL;
    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        target = self.progress;
        const onHero = self.progress < heroEnd;
        root.dataset.hero = onHero ? "1" : "0";
        root.dataset.nav = onHero || self.direction < 0 ? "show" : "hide";
      },
    });

    let lastTime = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      const diff = target - current;
      if (Math.abs(diff) > 0.00005) {
        current += diff * (1 - Math.exp(-dt / 0.08));
        dirty = true;
      } else if (current !== target) {
        current = target;
        dirty = true;
      }
      if (dirty) {
        dirty = false;
        update(current);
      }
    };
    gsap.ticker.add(tick);

    const onResize = () => {
      resize();
      buildStore();
    };
    const mq = window.matchMedia(MOBILE_QUERY);
    window.addEventListener("resize", onResize);
    mq.addEventListener("change", onResize);

    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "h" || !hud) return;
      const on = hud.dataset.on === "1" ? "0" : "1";
      hud.dataset.on = on;
      window.localStorage.setItem("lrp-hud", on);
      if (on === "0") hud.textContent = "";
      dirty = true;
    };
    window.addEventListener("keydown", onKey);

    resize();
    loadManifest()
      .then((m) => {
        if (disposed) return;
        manifest = m;
        buildStore();
      })
      .catch((err) => console.error("Could not load frame manifest", err));

    return () => {
      disposed = true;
      gsap.ticker.remove(tick);
      trigger.kill();
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", onResize);
      window.removeEventListener("keydown", onKey);
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
