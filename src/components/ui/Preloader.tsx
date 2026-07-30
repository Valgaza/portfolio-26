"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { me } from "@/data/me";
import { useIsoLayoutEffect } from "@/lib/animation/reveal";

/**
 * Preloader — the load-in curtain. A row of charcoal bars covers the paper; the
 * name rises letter-by-letter out of a clip, holds, then the bars drop away in a
 * stagger to reveal the site. Technique ported from Tajmirul's portfolio,
 * reskinned to the light-industrial palette (ink bars, paper name).
 *
 * Runs once and removes itself from the DOM (`done`). Under reduced-motion it
 * renders nothing at all — no curtain, no flash.
 */
const NBSP = " ";
const NAME = me.name.toUpperCase();
const BAR_COUNT = 10;

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }

    const ctx = gsap.context(() => {
      // Park the letters below their clip so the first paint is already the
      // pre-animation state (useLayoutEffect runs before paint → no flash).
      gsap.set(".pre-letter", { yPercent: 100 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => setDone(true),
      });

      tl.to(".pre-letter", { yPercent: 0, stagger: 0.05, duration: 0.5 });
      // Hold, then drop the bars away to reveal the page.
      tl.to(".pre-bar", { yPercent: 100, stagger: 0.06, duration: 0.6 }, "+=0.5");
      tl.to(".pre-name", { autoAlpha: 0, duration: 0.4 }, "<0.1");
      tl.to(root.current, { autoAlpha: 0, duration: 0.3 }, "<0.3");
    }, root);

    return () => ctx.revert();
  }, []);

  if (done) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[999] flex" aria-hidden>
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div key={i} className="pre-bar h-full flex-1 bg-foreground" />
      ))}

      <p className="pre-name absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 overflow-hidden pb-[0.1em] font-display text-[13vw] leading-none text-background">
        {NAME.split("").map((ch, i) => (
          <span key={i} className="pre-letter inline-block">
            {ch === " " ? NBSP + NBSP : ch}
          </span>
        ))}
      </p>
    </div>
  );
}
