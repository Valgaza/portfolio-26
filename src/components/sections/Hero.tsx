"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { me } from "@/data/me";
import { MaskLine, useIsoLayoutEffect } from "@/lib/animation/reveal";

/**
 * Hero. Unlike the sections below the fold, the Hero fires its reveal on LOAD
 * (not on scroll), so it keeps its own timeline instead of `useScrollReveal`.
 * It still reuses the shared <MaskLine> primitive and the `.reveal-fade`
 * convention, so the effect is identical to the rest of the site.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".mask-line__inner", { yPercent: 110 });
      gsap
        .timeline({ delay: 0.15 })
        .to(".mask-line__inner", {
          yPercent: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.12,
        })
        .from(
          ".reveal-fade",
          { autoAlpha: 0, y: 16, duration: 0.8, ease: "power2.out", stagger: 0.1 },
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
      <p className="reveal-fade mb-6 font-mono text-sm uppercase tracking-[0.25em] text-accent">
        {me.location} — Portfolio
      </p>

      <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">
        <MaskLine>Hi, I&apos;m {me.name.split(" ")[0]}.</MaskLine>
        <MaskLine>I build things</MaskLine>
        <MaskLine>
          that feel <span className="text-accent">alive</span>.
        </MaskLine>
      </h1>

      <p className="reveal-fade mt-8 max-w-xl text-lg leading-relaxed text-muted">
        {me.role}. {me.degree} @ {me.college}.
      </p>

      <div className="reveal-fade mt-16 flex items-center gap-3 text-sm text-muted">
        <span className="inline-block h-8 w-px animate-pulse bg-muted/60" />
        Scroll to explore
      </div>
    </section>
  );
}
