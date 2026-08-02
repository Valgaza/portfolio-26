"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useIsoLayoutEffect } from "@/lib/animation/reveal";

/**
 * ParticleBackground — a very subtle field of drifting motes behind everything.
 * Technique ported from Tajmirul's portfolio: a fixed layer of tiny dots at
 * random positions/opacity, each slowly falling one screen-height and fading,
 * looping forever. Sits at -z-10 (above the canvas, below all content) and is
 * inert (pointer-events-none, aria-hidden). Skipped under reduced-motion.
 *
 * DENSITY is scaled to the viewport AREA (not a fixed count), so a phone doesn't
 * get the same ~150 dots packed into a fraction of the space (which read as
 * clutter). One dot per ~DENSITY px², clamped to [MIN, MAX].
 */
const DENSITY = 12000; // px² of viewport per dot
const MIN = 35;
const MAX = 150;

export default function ParticleBackground() {
  const root = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  // Pick the count from the viewport area on mount. Starts at 0 so the server
  // and first client render agree (no hydration mismatch); the real dots land a
  // tick later and fade in.
  useIsoLayoutEffect(() => {
    const area = window.innerWidth * window.innerHeight;
    setCount(gsap.utils.clamp(MIN, MAX, Math.round(area / DENSITY)));
  }, []);

  // Animate once the dots exist.
  useIsoLayoutEffect(() => {
    if (!count) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const dots = gsap.utils.toArray<HTMLElement>(".particle", root.current!);
      dots.forEach((p) => {
        const size = gsap.utils.random(2, 6);
        gsap.set(p, {
          width: size,
          height: size,
          x: gsap.utils.random(0, window.innerWidth),
          y: gsap.utils.random(0, window.innerHeight),
          opacity: gsap.utils.random(0.3, 0.8),
        });
        gsap.to(p, {
          y: "+=" + window.innerHeight,
          opacity: 0,
          duration: gsap.utils.random(12, 22),
          repeat: -1,
          ease: "none",
          delay: gsap.utils.random(0, 12),
        });
      });
    }, root);

    return () => ctx.revert();
  }, [count]);

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="particle absolute rounded-full bg-foreground" />
      ))}
    </div>
  );
}
