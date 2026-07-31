"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Wires Lenis (smooth scrolling) to GSAP's ScrollTrigger so they share one
 * clock and one scroll value.
 *
 * WHY THIS EXISTS — the core integration trick:
 * ScrollTrigger normally listens to the browser's native `scroll` event and
 * reads `window.scrollY`. But Lenis intercepts the wheel/touch input and
 * *virtualizes* scrolling — it lerps the page toward a target position every
 * frame. If we don't connect them, ScrollTrigger sees stale/native positions
 * and reveals fire at the wrong spot (or double-fire). So we:
 *
 *   1. `lenis.on("scroll", ScrollTrigger.update)` — every time Lenis moves the
 *      page, tell ScrollTrigger to recompute. Now triggers read Lenis's value.
 *
 *   2. Drive Lenis's own `requestAnimationFrame` loop from `gsap.ticker`
 *      instead of a separate rAF. One render clock for everything = no drift
 *      between the animation and the scroll it's tied to. (gsap.ticker gives
 *      time in seconds; Lenis wants milliseconds, hence `* 1000`.)
 *
 *   3. `lagSmoothing(0)` — disable GSAP's frame-skip catch-up so scrubbed
 *      animations stay locked to the scroll position under load.
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis();
    // Expose the instance so the navbar / logo can smooth-scroll to sections.
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    // (1) Lenis → ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // (2) GSAP ticker → Lenis rAF
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);

    // (3) keep scrubbed animations glued to scroll
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
