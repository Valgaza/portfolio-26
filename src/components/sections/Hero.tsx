"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { me } from "@/data/me";

// useLayoutEffect on the client (measure before paint = no flash), plain
// useEffect on the server to avoid the SSR warning.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Hero with a "masked line reveal" intro.
 *
 * THE TECHNIQUE:
 * Each line of text sits inside a wrapper with `overflow-hidden` (the mask).
 * The actual text is a child span that we start pushed DOWN by 110% of its own
 * height (`yPercent: 110`) — parked below the mask and clipped out of view. On
 * mount we animate it back to its natural position (`yPercent: 0`). Because the
 * parent clips, each line appears to "rise up" out of nothing.
 *
 * `stagger` offsets the lines so they cascade; `power4.out` gives the
 * fast-then-settle feel. `gsap.context(scope)` limits our selectors to inside
 * this section and lets `ctx.revert()` tear everything down on unmount.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".line > span", { yPercent: 110 });
      gsap
        .timeline({ delay: 0.15 })
        .to(".line > span", {
          yPercent: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.12,
        })
        .from(
          ".hero-fade",
          { autoAlpha: 0, y: 16, duration: 0.8, ease: "power2.out" },
          "-=0.5",
        );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="hero"
      className="relative flex min-h-screen flex-col justify-center px-6 sm:px-12 lg:px-20"
    >
      <p className="hero-fade mb-6 font-mono text-sm uppercase tracking-[0.25em] text-accent">
        {me.location} — Portfolio
      </p>

      <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">
        <Line>Hi, I&apos;m {me.name.split(" ")[0]}.</Line>
        <Line>I build things</Line>
        <Line>
          that feel <span className="text-accent">alive</span>.
        </Line>
      </h1>

      <p className="hero-fade mt-8 max-w-xl text-lg leading-relaxed text-muted">
        {me.role}. {me.degree} @ {me.college}.
      </p>

      <div className="hero-fade mt-16 flex items-center gap-3 text-sm text-muted">
        <span className="inline-block h-8 w-px animate-pulse bg-muted/60" />
        Scroll to explore
      </div>
    </section>
  );
}

/**
 * One masked line. The outer span clips (overflow-hidden); the inner span is
 * the element GSAP moves. `pb-[0.1em]` gives descenders (g, y, p) room so they
 * aren't clipped when at rest.
 */
function Line({ children }: { children: React.ReactNode }) {
  return (
    <span className="line block overflow-hidden pb-[0.1em]">
      <span className="block">{children}</span>
    </span>
  );
}
