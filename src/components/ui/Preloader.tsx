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
      // Park the letters below their clip, and reveal the name container that the
      // server paints at opacity 0 (see the inline style below). This runs in the
      // layout effect, before paint, so there's never a frame of the full name at
      // rest — GSAP fully owns the letters' yPercent from here.
      gsap.set(".pre-name", { opacity: 1 });
      // Park a touch beyond 100% — the clip has pb-[0.1em] below it, so a plain
      // 100% leaves a sliver of the letter tops peeking above the clip edge.
      gsap.set(".pre-letter", { yPercent: 120 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => setDone(true),
      });

      tl.to(".pre-letter", { yPercent: 0, stagger: 0.06, duration: 0.6 });
      // Hold, then drop the bars away to reveal the page.
      tl.to(".pre-bar", { yPercent: 100, stagger: 0.07, duration: 0.7 }, "+=0.6");
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

      {/* opacity:0 on first paint (server HTML) so the full name never flashes
          before the layout effect parks the letters below the clip; GSAP fades it
          back in (opacity 1) and animates the letters up. */}
      <p
        className="pre-name absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 overflow-hidden pb-[0.1em] font-display text-[13vw] leading-none text-background"
        style={{ opacity: 0 }}
      >
        {NAME.split("").map((ch, i) => (
          <span key={i} className="pre-letter inline-block">
            {ch === " " ? NBSP + NBSP : ch}
          </span>
        ))}
      </p>
    </div>
  );
}
