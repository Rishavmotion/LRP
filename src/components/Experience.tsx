"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import Nav from "./Nav";
import Stage from "./Stage";
import Footer from "./Footer";

export default function Experience() {
  // Smooth wheel scrolling. Lenis drives the native scroll position, so the
  // stage just listens to `scroll`. Touch devices keep native scrolling.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: true });
    return () => lenis.destroy();
  }, []);

  return (
    <>
      <Nav />
      <main>
        <Stage />
        <Footer />
      </main>
    </>
  );
}
