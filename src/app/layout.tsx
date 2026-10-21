import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={display.variable}>
      <body>{children}</body>
    </html>
  );
}
