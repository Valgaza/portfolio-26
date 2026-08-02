"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { me } from "@/data/me";
import { useIsoLayoutEffect } from "@/lib/animation/reveal";

/**
 * Experience — a pinned "chapter". The viewport frame pins ONCE and stays put;
 * scrolling doesn't move the section, it PROGRESSES a horizontal timeline left→
 * right (the accent rail fills, nodes pop, cards + bodies resolve in), then the
 * drawn timeline rests for a beat before the pin releases to the next section.
 *
 * (This used to be fused with Skills into one morphing chapter — they're now
 * separate sections with the project gallery between them, so the handoff is
 * gone; this is just the timeline, standalone.)
 *
 * On mobile / reduced-motion the desktop stepper is hidden and a plain vertical
 * timeline is shown instead (no pin, no scrub).
 */
const exp = me.experiences;
const n = exp.length;

// How much scroll (viewport-heights) the pinned chapter consumes: the timeline
// draw plus a hold at the end. Shorter than the old fused chapter since it no
// longer covers Skills too.
const EXP_SCROLL = 1.5;

export default function Experience() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    // Desktop + motion: the pinned, scrubbed timeline draw.
    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const q = gsap.utils.selector(layer.current!);
        const fill = q(".exp-fill");
        const nodes = q(".exp-node");
        const cards = q(".exp-card");
        const bodies = q(".exp-body");

        // ── initial (undrawn) states ────────────────────────────────────────
        gsap.set(fill, { width: 0 });
        gsap.set(nodes, { scale: 0.5, autoAlpha: 0 });
        gsap.set(cards, { y: 34, autoAlpha: 0 });
        gsap.set(bodies, { y: 18, autoAlpha: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => "+=" + window.innerHeight * EXP_SCROLL,
            // Pin the INNER box, not the <section> (a flex child of <main>) —
            // pinning a flex child collapses the pin-spacer so the next section
            // hides underneath. Opaque + z-10 so nothing bleeds through.
            pin: pin.current,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // ── draw the timeline (0 → ~0.66), spread across the scrub ───────────
        const spread = 0.6; // where the last node lands
        // The red fill draws the FULL grey-track width (a bit past the last
        // node) across almost the whole pin, finishing just before release.
        const drawEnd = 0.92;
        tl.to(
          fill,
          {
            width: "100%",
            ease: "none",
            duration: drawEnd,
          },
          0,
        );
        for (let i = 0; i < n; i++) {
          const at = n > 1 ? (i / (n - 1)) * spread : 0;
          tl.to(
            nodes[i],
            { scale: 1, autoAlpha: 1, ease: "back.out(1.7)", duration: 0.06 },
            at,
          );
          tl.to(
            cards[i],
            { y: 0, autoAlpha: 1, ease: "back.out(1.3)", duration: 0.09 },
            at + 0.01,
          );
          tl.to(
            bodies[i],
            { y: 0, autoAlpha: 1, ease: "power2.out", duration: 0.09 },
            at + 0.02,
          );
        }

        // ── the instant the fill reaches the end, a tiny settle then release ─
        tl.to({}, { duration: 0.06 }, drawEnd);
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="experience" className="relative">
      {/* The pinned box (inner div, not the <section>). z-10 keeps it above the
          fixed particle field; we DON'T fill it (no bg-background) so the drifting
          particles show through this section too. Nothing overlaps it during the
          pinned scroll, so there's nothing to bleed through. */}
      <div
        ref={pin}
        className="relative z-10 md:h-screen md:overflow-hidden"
      >
        <div
          ref={layer}
          className="relative flex flex-col gap-16 px-6 py-24 sm:px-12 md:absolute md:inset-0 md:gap-0 md:px-12 md:pb-16 md:pt-24 lg:px-20"
        >
          {/* Header */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5">
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-muted">
                Career
              </p>
              <h2 className="font-display text-4xl tracking-tight sm:text-5xl lg:text-6xl">
                Experience &amp; education
              </h2>
            </div>
            <p className="max-w-xs text-lg leading-relaxed text-muted lg:text-right">
              The path so far — where I&apos;ve studied and the teams I&apos;ve
              built with.
            </p>
          </div>

          {/* Content — vertically centred in the remaining space on desktop. */}
          <div className="md:flex md:flex-1 md:items-center">
            {/* Desktop: horizontal stepper (animated). */}
            <div
              className="exp-timeline exp-track relative hidden w-full gap-y-8 md:grid"
              style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
            >
              {/* Row 1 — cards (period + org). */}
              {exp.map((e) => (
                <div
                  key={`card-${e.org}`}
                  className="exp-card flex h-40 flex-col justify-end gap-2 pr-6"
                >
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                    {e.kind === "education" ? "Education" : "Experience"}
                  </span>
                  <span className="font-display text-xl leading-[0.95] tracking-tight lg:text-[2rem]">
                    {e.org}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                    {e.period}
                  </span>
                </div>
              ))}

              {/* Row 2 — rail (track + accent fill + dot) with nodes on it. */}
              <div className="relative col-span-full flex h-9 items-center">
                <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-foreground/15" />
                <div
                  className="exp-fill absolute left-0 top-1/2 h-px -translate-y-1/2 bg-accent"
                  style={{ width: 0 }}
                >
                  <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
                </div>
                <div
                  className="absolute inset-0 grid"
                  style={{
                    gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
                  }}
                >
                  {exp.map((e, i) => (
                    <div key={`node-${e.org}`} className="flex items-center">
                      <span className="exp-node relative z-10 flex h-7 w-7 items-center justify-center rounded-[5px] bg-accent font-mono text-xs font-semibold text-on-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3 — bodies (title + description). */}
              {exp.map((e) => (
                <div
                  key={`body-${e.org}`}
                  className="exp-body max-w-xs pr-6 pt-6"
                >
                  <h3 className="font-display text-xl leading-tight tracking-tight lg:text-2xl">
                    {e.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {e.description}
                  </p>
                  {e.location ? (
                    <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-muted">
                      {e.location}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Mobile: vertical timeline (static). */}
            <div className="flex w-full flex-col gap-10 md:hidden">
              {exp.map((e, i) => (
                <div
                  key={`m-${e.org}`}
                  className="relative border-l-2 border-accent/50 pl-6"
                >
                  <span className="absolute -left-[15px] top-0 flex h-7 w-7 items-center justify-center rounded-[5px] bg-accent font-mono text-xs font-semibold text-on-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-accent">
                    {e.period}
                  </span>
                  <h3 className="mt-2 font-display text-2xl leading-tight tracking-tight">
                    {e.title}
                  </h3>
                  <p className="mt-1 font-mono text-xs uppercase tracking-[0.15em] text-muted">
                    {e.org} ·{" "}
                    {e.kind === "education" ? "Education" : "Experience"}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {e.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
