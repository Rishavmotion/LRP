import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { PRELOAD_FRAMES, TIER_QUERIES, frameUrl, type Tier } from "@/lib/tier";
import "./globals.css";

// Stand-in for Locator Light / Medium. When the Locator web files are licensed,
// replace this with:
//
//   import localFont from "next/font/local";
//   const display = localFont({
//     variable: "--font-sans",
//     src: [
//       { path: "./fonts/Locator-Light.woff2", weight: "300" },
//       { path: "./fonts/Locator-Medium.woff2", weight: "500" },
//     ],
//   });
const display = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anthelios — Protection, In Motion | La Roche-Posay",
  description: "Daily mineral protection designed for life under the sun.",
};

export const viewport: Viewport = {
  themeColor: "#061624",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// The opening frames for each tier, fetched from the HTML before any JS runs.
// `media` makes each device fetch only its own tier.
const PRELOADS = (Object.keys(TIER_QUERIES) as Tier[]).flatMap((tier) =>
  Array.from({ length: PRELOAD_FRAMES }, (_, i) => ({ tier, href: frameUrl(tier, i) }))
);

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={display.variable}>
      <head>
        {PRELOADS.map(({ tier, href }) => (
          <link
            key={href}
            rel="preload"
            as="image"
            type="image/webp"
            href={href}
            media={TIER_QUERIES[tier]}
            fetchPriority={href.endsWith("0000.webp") ? "high" : "auto"}
          />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
