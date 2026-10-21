"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Nav from "./Nav";
import Stage from "./Stage";
import Footer from "./Footer";

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  // Smooth scrolling (Lenis) driven by GSAP's ticker so ScrollTrigger and the
  // canvas scrub share one clock. Touch devices keep native scrolling.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
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
