"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { me } from "@/data/me";
import { MaskLine, useIsoLayoutEffect } from "@/lib/animation/reveal";

/**
 * Journey — Experience + Skills fused into ONE pinned "chapter".
 *
 * THE POINT: two separate pinned sections can't hand off cleanly — each reserves
 * its own block of scroll space, so the second visibly slides up as a new panel.
 * Here the viewport frame pins ONCE and never moves; the two "sections" are
 * absolutely stacked layers inside it, and a single scrubbed timeline cross-
 * transitions between them:
 *
 *   1. draw the Experience timeline  → hold
 *   2. HANDOFF — the Experience title + timeline drift up and out while the
 *      Skills title rises into the same spot and the toolkit grid resolves in
 *      (a "stacked replace" — one title leaves as the next takes its place)
 *   3. hold on Skills → release to Contact
 *
 * On mobile / reduced-motion the two layers un-stack into normal flow (no pin):
 * a vertical Experience timeline followed by the toolkit grid, both static.
 */
const exp = me.experiences;
const n = exp.length;

// How much scroll (viewport-heights) the single pinned chapter consumes. It
// covers BOTH former sections plus the handoff, so it's naturally long.
const JOURNEY_SCROLL = 2.4;

// Outlined skill pill. On hover it lifts, its border turns neon, the text
// brightens, and a soft accent glow blooms behind it.
const CHIP_CLASS =
  "cursor-default whitespace-nowrap rounded-full border border-white/10 px-4 py-2 font-mono text-sm uppercase tracking-[0.1em] text-muted transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-accent/60 hover:text-foreground hover:shadow-[0_0_22px_-6px_var(--accent)]";

export default function Journey() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const expLayer = useRef<HTMLDivElement>(null);
  const skillsLayer = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    // Desktop + motion: the pinned, cross-transitioning chapter.
    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const qe = gsap.utils.selector(expLayer.current!);
        const qs = gsap.utils.selector(skillsLayer.current!);

        const expHead = qe(".j-head");
        const expTimeline = qe(".exp-timeline");
        const fill = qe(".exp-fill");
        const nodes = qe(".exp-node");
        const cards = qe(".exp-card");
        const bodies = qe(".exp-body");

        const skLines = qs(".mask-line__inner");
        const skFades = qs(".reveal-fade");

        // ── initial states ─────────────────────────────────────────────────
        // Experience header is visible from the start (the chapter opens on it);
        // the timeline pieces are undrawn.
        gsap.set(fill, { width: 0 });
        gsap.set(nodes, { scale: 0.5, autoAlpha: 0 });
        gsap.set(cards, { y: 34, autoAlpha: 0 });
        gsap.set(bodies, { y: 18, autoAlpha: 0 });
        // Skills layer sits on top but empty — every piece hidden until handoff.
        // 130 (not 110) so the mask clip's descender padding can't leave the
        // tops of the hidden heading letters peeking out under the Experience one.
        gsap.set(skLines, { yPercent: 130 });
        gsap.set(skFades, { autoAlpha: 0, y: 40 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => "+=" + window.innerHeight * JOURNEY_SCROLL,
            // Pin the INNER box, not the <section> (which is a flex child of
            // <main>). Pinning a flex child directly collapses the pin-spacer, so
            // no scroll space is reserved and later sections hide underneath.
            pin: pin.current,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // ── PHASE 1 — draw the Experience timeline (0 → ~0.34) ──────────────
        const spread = 0.24; // where the last node lands
        tl.to(
          fill,
          {
            width: `${((n - 1) / n) * 100}%`,
            ease: "none",
            duration: spread + 0.06,
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

        // ── PHASE 2 — hold (~0.34 → 0.46): the drawn timeline rests. ─────────

        // ── PHASE 3 — HANDOFF (0.46 → ~0.66) ────────────────────────────────
        // Experience title + timeline drift UP and fade out…
        tl.to(
          expHead,
          { y: -90, autoAlpha: 0, ease: "power2.in", duration: 0.13 },
          0.46,
        );
        tl.to(
          expTimeline,
          { y: -90, autoAlpha: 0, ease: "power2.in", duration: 0.13 },
          0.47,
        );
        // …as the Skills title rises into the same spot and the grid resolves in.
        tl.to(
          skLines,
          { yPercent: 0, ease: "power4.out", duration: 0.16, stagger: 0.03 },
          0.53,
        );
        tl.to(
          skFades,
          {
            autoAlpha: 1,
            y: 0,
            ease: "power2.out",
            duration: 0.18,
            stagger: 0.035,
          },
          0.57,
        );

        // ── PHASE 4 — hold on Skills (~0.66 → 1.0), then the pin releases. ───
        tl.to({}, { duration: 0.34 }, 0.66);
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="experience" className="relative">
      {/* The pinned box. Pinning THIS inner div (not the <section>, a flex child
          of <main>) keeps ScrollTrigger's pin-spacer intact so the sections
          after it get their scroll space. Opaque + z-10 so nothing bleeds
          through while it's pinned. */}
      <div
        ref={pin}
        className="relative z-10 bg-background md:h-screen md:overflow-hidden"
      >
        {/* ── Layer A — Experience ───────────────────────────────────────── */}
        <div
          ref={expLayer}
          className="relative flex flex-col gap-16 px-6 py-24 sm:px-12 md:absolute md:inset-0 md:gap-0 md:px-12 md:py-[14vh] lg:px-20"
        >
          {/* Header */}
          <div className="j-head flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
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
                  <span className="font-display text-2xl leading-[0.95] tracking-tight lg:text-[2rem]">
                    {e.org}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                    {e.period}
                  </span>
                </div>
              ))}

              {/* Row 2 — rail (track + accent fill + dot) with nodes on it. */}
              <div className="relative col-span-full flex h-9 items-center">
                <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/12" />
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
                      <span className="exp-node relative z-10 flex h-7 w-7 items-center justify-center rounded-[5px] bg-accent font-mono text-xs font-semibold text-background">
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
                    <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-muted/70">
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

        {/* ── Layer B — Skills (stacked on top, hidden until the handoff) ────── */}
        <div
          ref={skillsLayer}
          id="skills"
          className="relative flex flex-col gap-16 px-6 py-24 sm:px-12 md:absolute md:inset-0 md:gap-0 md:px-12 md:py-[14vh] lg:px-20"
        >
          {/* Header */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5">
              <p className="reveal-fade font-mono text-xs uppercase tracking-[0.35em] text-muted">
                Full Toolkit
              </p>
              <h2 className="font-display text-4xl tracking-tight sm:text-5xl lg:text-6xl">
                <MaskLine>Technologies I work with</MaskLine>
              </h2>
            </div>
            <p className="reveal-fade max-w-xs text-lg leading-relaxed text-muted lg:text-right">
              Grouped by practice area—same stack I use on production work and
              personal builds.
            </p>
          </div>

          {/* Grid of skill groups. */}
          <div className="md:flex md:flex-1 md:items-center">
            <div className="grid w-full grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {me.skills.map((group) => (
                <div
                  key={group.category}
                  className="reveal-fade flex flex-col gap-5"
                >
                  <h3 className="font-mono text-[0.92rem] uppercase tracking-[0.2em] text-accent">
                    {group.category}
                  </h3>
                  <ul className="flex flex-wrap gap-3">
                    {group.items.map((item) => (
                      <li key={item} className={CHIP_CLASS}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
