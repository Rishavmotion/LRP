import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site is fully static: `next build` writes a plain HTML/JS/CSS bundle to
  // `out/`, which Cloudflare Pages serves straight from its CDN (no adapter).
  output: "export",
  // Static export can't run the image optimizer; the only <Image> is the logo.
  images: { unoptimized: true },
  // Cache Components (PPR) needs a Node server and is incompatible with
  // export mode; this page has no server data to cache anyway.
};

export default nextConfig;
