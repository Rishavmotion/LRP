// Build the scroll-sequence frames from the LRP render.
//
// Source: ../LRP_renders/Frames/frame_00000.jpg … frame_00850.jpg (2880×1620, 50fps)
// Output: public/frames/<VERSION>/<set>/<index>.webp, public/frames/manifest.json,
//         public/posters/poster*.jpg
//
// Frames are served with a 1-year immutable cache (public/_headers), so a
// re-render MUST bump VERSION — otherwise returning visitors keep old frames.
//
// Usage:  node scripts/build-frames.mjs            (skips frames already built)
//         node scripts/build-frames.mjs --force    (rebuilds everything)
//
// Tunables are at the top. STEP controls decimation: STEP=2 keeps every 2nd
// source frame (426 frames). Scroll scrubbing doesn't need 50fps density.

import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.resolve(ROOT, "..", "LRP_renders", "Frames");
const VERSION = "v1";
const FRAMES_DIR = path.resolve(ROOT, "public", "frames");
const OUT_DIR = path.join(FRAMES_DIR, VERSION);
const POSTER_DIR = path.resolve(ROOT, "public", "posters");

const SOURCE_COUNT = 851; // frame_00000 … frame_00850
const SOURCE_W = 2880;
const SOURCE_H = 1620;
const STEP = 2;

// Resolution ladder. The page picks a tier from viewport width × DPR
// (see src/lib/tier.ts). q70 measured within 0.002 SSIM of q78 on this
// footage at 20% fewer bytes; q62 saved almost nothing more.
const SETS = {
  // Landscape tiers (kind: "landscape").
  d1280: { width: 1280, height: 720, quality: 72, crop: null, kind: "landscape" },
  d1920: { width: 1920, height: 1080, quality: 70, crop: null, kind: "landscape" },
  d2560: { width: 2560, height: 1440, quality: 70, crop: null, kind: "landscape" },
  // 9:16 centre crop for phones (the Figma mobile frames are the same crop).
  m810: { width: 810, height: 1440, quality: 70, crop: { w: 911, h: 1620 }, kind: "portrait" },
};
const POSTER_SET = "d1920";
const POSTER_MOBILE_SET = "m810";
// The hero opens on source frame 10 (src/lib/scenes.ts); the poster shows the same.
const POSTER_SOURCE_FRAME = 10;

const FORCE = process.argv.includes("--force");
const WORKERS = Math.max(2, Math.floor(os.cpus().length / 2));

const pad = (n) => String(n).padStart(4, "0");
const srcPath = (i) => path.join(SRC_DIR, `frame_${String(i).padStart(5, "0")}.jpg`);

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function pipeline(input, set) {
  let img = sharp(input, { failOn: "none" });
  if (set.crop) {
    img = img.extract({
      left: Math.round((SOURCE_W - set.crop.w) / 2),
      top: Math.round((SOURCE_H - set.crop.h) / 2),
      width: set.crop.w,
      height: set.crop.h,
    });
  }
  return img.resize(set.width, set.height, { fit: "cover", kernel: "lanczos3" });
}

async function buildFrame(outIndex, srcIndex) {
  const input = srcPath(srcIndex);
  for (const [name, set] of Object.entries(SETS)) {
    const out = path.join(OUT_DIR, name, `${pad(outIndex)}.webp`);
    if (!FORCE && (await exists(out))) continue;
    await pipeline(input, set)
      .webp({ quality: set.quality, effort: 4, smartSubsample: true })
      .toFile(out);
  }
}

async function buildPoster() {
  await fs.mkdir(POSTER_DIR, { recursive: true });
  const out = path.join(POSTER_DIR, "poster.jpg");
  const outMobile = path.join(POSTER_DIR, "poster-mobile.jpg");
  if (FORCE || !(await exists(out))) {
    await pipeline(srcPath(POSTER_SOURCE_FRAME), SETS[POSTER_SET]).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
  }
  if (FORCE || !(await exists(outMobile))) {
    await pipeline(srcPath(POSTER_SOURCE_FRAME), SETS[POSTER_MOBILE_SET]).jpeg({ quality: 80, mozjpeg: true }).toFile(outMobile);
  }
}

async function dirSize(dir) {
  const files = await fs.readdir(dir);
  let total = 0;
  for (const f of files) total += (await fs.stat(path.join(dir, f))).size;
  return { files: files.length, mb: (total / 1024 / 1024).toFixed(1) };
}

async function main() {
  const indices = [];
  for (let s = 0; s < SOURCE_COUNT; s += STEP) indices.push(s);
  const count = indices.length;

  for (const name of Object.keys(SETS)) {
    await fs.mkdir(path.join(OUT_DIR, name), { recursive: true });
  }

  console.log(`Building ${count} frames × ${Object.keys(SETS).length} sets with ${WORKERS} workers (STEP=${STEP})`);
  const started = Date.now();
  let next = 0;
  let done = 0;

  async function worker() {
    while (next < count) {
      const i = next++;
      await buildFrame(i, indices[i]);
      done++;
      if (done % 25 === 0 || done === count) {
        const secs = ((Date.now() - started) / 1000).toFixed(0);
        console.log(`  ${done}/${count}  (${secs}s)`);
      }
    }
  }

  await Promise.all(Array.from({ length: WORKERS }, worker));
  await buildPoster();

  const manifest = {
    version: VERSION,
    step: STEP,
    count,
    sourceCount: SOURCE_COUNT,
    sourceFps: 50,
    sets: Object.fromEntries(
      Object.entries(SETS).map(([name, s]) => [name, { width: s.width, height: s.height, kind: s.kind }])
    ),
  };
  await fs.writeFile(path.join(FRAMES_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));

  for (const name of Object.keys(SETS)) {
    const { files, mb } = await dirSize(path.join(OUT_DIR, name));
    console.log(`${name}: ${files} files, ${mb} MB`);
  }
  console.log(`Done in ${((Date.now() - started) / 1000).toFixed(0)}s`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
