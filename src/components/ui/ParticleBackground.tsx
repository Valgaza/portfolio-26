"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useIsoLayoutEffect } from "@/lib/animation/reveal";

/**
 * ParticleBackground — a very subtle field of drifting motes behind everything.
 * Technique ported from Tajmirul's portfolio: a fixed layer of tiny dots at
 * random positions/opacity, each slowly falling one screen-height and fading,
 * looping forever. Sits at -z-10 (above the canvas, below all content) and is
 * inert (pointer-events-none, aria-hidden). Skipped under reduced-motion.
 */
const COUNT = 150;

export default function ParticleBackground() {
  const root = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
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
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {Array.from({ length: COUNT }).map((_, i) => (
        <span key={i} className="particle absolute rounded-full bg-foreground" />
      ))}
    </div>
  );
}
