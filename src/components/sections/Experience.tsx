"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { me } from "@/data/me";
import { MaskLine, useIsoLayoutEffect, useScrollReveal } from "@/lib/animation/reveal";

/**
 * Experience — a horizontal timeline / process stepper, rebuilt from the
 * shadcn `skiper104` walkthrough (motiscope analysis) into a career block.
 *
 * MOTION (timing = measured from the recording, the rest is our reading):
 *  • an accent progress RAIL fills left-to-right with a leading dot on its head,
 *  • a numbered NODE pops in (spring overshoot, measured `cubic-bezier(0.34,
 *    1.56, 0.64, 1)` ≈ `back.out`) as the fill reaches it,
 *  • the CARD above (period + org, org set large like the "Aa" specimen) rises,
 *  • the BODY below (title + description) fades up.
 * Measured left-to-right stagger was ~624ms/step; here it's scrubbed to the
 * section's scroll so the whole timeline draws as you move past it.
 *
 * LAYOUT: horizontal stepper on md+ (the animated version); a simple vertical
 * timeline on mobile (revealed by the shared `.reveal-fade` utility). The header
 * + mobile cards animate via `useScrollReveal`; the desktop rail has its own
 * scrubbed timeline, built only at md+ and only when motion is allowed.
 */
const exp = me.experiences;
const n = exp.length;

export default function Experience() {
  const root = useRef<HTMLElement>(null);

  // Header MaskLine + mobile `.reveal-fade` cards.
  useScrollReveal(root);

  // Desktop scrubbed rail. `gsap.matchMedia` builds it only at md+ with motion
  // allowed, and reverts every set/tween it made when that stops matching.
  useIsoLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const q = gsap.utils.selector(root.current!);
        const fill = q(".exp-fill");
        const nodes = q(".exp-node");
        const cards = q(".exp-card");
        const bodies = q(".exp-body");

        gsap.set(fill, { width: 0 });
        gsap.set(nodes, { scale: 0.5, autoAlpha: 0 });
        gsap.set(cards, { y: 34, autoAlpha: 0 });
        gsap.set(bodies, { y: 18, autoAlpha: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 72%",
            end: "bottom 65%",
            scrub: 1,
          },
        });

        // Rail fills from the first node to the last (nodes sit at column-left,
        // so the last one is at (n-1)/n across the track).
        tl.to(
          fill,
          { width: `${((n - 1) / n) * 100}%`, ease: "none", duration: 1 },
          0,
        );

        for (let i = 0; i < n; i++) {
          const at = n > 1 ? (i / (n - 1)) * 0.82 : 0;
          tl.to(
            nodes[i],
            { scale: 1, autoAlpha: 1, ease: "back.out(1.7)", duration: 0.14 },
            at,
          );
          tl.to(
            cards[i],
            { y: 0, autoAlpha: 1, ease: "back.out(1.3)", duration: 0.2 },
            at + 0.02,
          );
          tl.to(
            bodies[i],
            { y: 0, autoAlpha: 1, ease: "power2.out", duration: 0.2 },
            at + 0.05,
          );
        }
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={root}
      id="experience"
      className="flex flex-col px-6 py-28 sm:px-12 lg:px-20"
    >
      {/* Header */}
      <div className="mb-16 flex flex-col gap-8 lg:mb-24 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-5">
          <p className="reveal-fade font-mono text-xs uppercase tracking-[0.35em] text-muted">
            Career
          </p>
          <h2 className="font-display text-4xl tracking-tight sm:text-5xl lg:text-6xl">
            <MaskLine>Experience &amp; education</MaskLine>
          </h2>
        </div>
        <p className="reveal-fade max-w-xs text-lg leading-relaxed text-muted lg:text-right">
          The path so far — where I&apos;ve studied and the teams I&apos;ve built
          with.
        </p>
      </div>

      {/* ── Desktop: horizontal stepper (animated) ─────────────────────────── */}
      <div
        className="exp-track relative hidden gap-y-8 md:grid"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {/* Row 1 — cards (period + org), bottom-aligned toward the rail. */}
        {exp.map((e) => (
          <div
            key={`card-${e.org}`}
            className="exp-card flex h-40 flex-col justify-end gap-2 pr-6"
          >
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              {e.kind === "education" ? "Education" : "Experience"}
            </span>
            <span className="font-display text-2xl leading-[0.95] tracking-tight lg:text-[2rem]">
              {e.org}
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              {e.period}
            </span>
          </div>
        ))}

        {/* Row 2 — the rail (faint track + accent fill + dot) with nodes on it. */}
        <div className="relative col-span-full flex h-9 items-center">
          <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/12" />
          <div
            className="exp-fill absolute left-0 top-1/2 h-px -translate-y-1/2 bg-accent"
            style={{ width: 0 }}
          >
            <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
          </div>
          {/* Nodes distributed on the same column grid so each lands at its
              column-left, aligned with the card + body above/below it. */}
          <div
            className="absolute inset-0 grid"
            style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
          >
            {exp.map((e, i) => (
              <div key={`node-${e.org}`} className="flex items-center">
                <span className="exp-node relative z-10 flex h-7 w-7 items-center justify-center rounded-[5px] bg-accent font-mono text-xs font-semibold text-background">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 3 — bodies (title + description). */}
        {exp.map((e) => (
          <div key={`body-${e.org}`} className="exp-body max-w-xs pr-6 pt-6">
            <h3 className="font-display text-xl leading-tight tracking-tight lg:text-2xl">
              {e.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {e.description}
            </p>
            {e.location ? (
              <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-muted/70">
                {e.location}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {/* ── Mobile: vertical timeline (revealed via .reveal-fade) ───────────── */}
      <div className="flex flex-col gap-10 md:hidden">
        {exp.map((e, i) => (
          <div
            key={`m-${e.org}`}
            className="reveal-fade relative border-l-2 border-accent/50 pl-6"
          >
            <span className="absolute -left-[15px] top-0 flex h-7 w-7 items-center justify-center rounded-[5px] bg-accent font-mono text-xs font-semibold text-background">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-accent">
              {e.period}
            </span>
            <h3 className="mt-2 font-display text-2xl leading-tight tracking-tight">
              {e.title}
            </h3>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.15em] text-muted">
              {e.org} · {e.kind === "education" ? "Education" : "Experience"}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {e.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
