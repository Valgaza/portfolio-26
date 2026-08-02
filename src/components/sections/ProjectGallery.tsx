"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import type { Project } from "@/data/me";
import {
  MaskLine,
  useScrollReveal,
  useIsoLayoutEffect,
  usePinSection,
} from "@/lib/animation/reveal";
import { LaunchArrow } from "@/components/ui/LaunchArrow";
import MaskRevealUp from "@/components/ui/MaskRevealUp";

/**
 * ProjectGallery — the "more builds" section: a horizontal hover-expand
 * accordion of every project. Each panel is a single image; hovering (or
 * tapping) a panel expands it and reveals a one-liner, tags and a code link.
 *
 * This is the BREADTH counterpart to the pinned <Showcase /> spotlight — light
 * on words by design (a sentence + a link, per project), so the accordion's
 * one-at-a-time nature is a feature, not a limitation.
 *
 * MOTION: the reference used framer-motion to tween `width` with an easeInOut
 * curve (~0.3s). We reproduce that 1:1 in GSAP so the whole site stays on one
 * animation engine — GSAP owns each panel's `flex-basis`, and React state only
 * tracks which panel is active (to toggle the overlay + content). Keeping React
 * out of the width means no inline-style tug-of-war with GSAP.
 */

// Panel sizing — PROPORTIONAL, not fixed. Panels have flex-basis:0 and share
// the row's width by flex-grow ratio, so the accordion always fits the viewport
// (no horizontal overflow) no matter how many projects there are. The active
// panel grows to ACTIVE_GROW, the rest to INACTIVE_GROW.
const ACTIVE_GROW = 7;
const INACTIVE_GROW = 1;
// Motion — matches the reference's easeInOut ~0.3s. Bump DURATION for a slower,
// more languid expand.
const DURATION = 0.4;
const EASE = "power2.inOut";

// ── Image treatment (Option A) ─────────────────────────────────────────────
// A fixed deep-teal wash sits over every card image so the gallery reads as one
// cohesive set against the canvas. TINT is a LITERAL colour (not a theme token)
// on purpose, so it darkens the image in BOTH light and dark themes. Dim at rest
// (TINT_REST) for cohesion; lifts toward full colour when a panel is active
// (TINT_ACTIVE). Tweak these three to taste.
const TINT = "#0e2a33"; // deep teal, theme-independent
const TINT_REST = 0.7; // overlay opacity on inactive panels (0–1)
const TINT_ACTIVE = 0.1; // overlay opacity on the active panel (0–1)

// Non-"live" projects get a small badge. `undefined`/"live" = no badge.
const STATUS_LABEL: Record<string, string> = {
  "in-progress": "In progress",
  research: "Research",
};

export default function ProjectGallery({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  useScrollReveal(root);
  usePinSection(root, pin, { dwell: 0.8 });

  // Start with the first panel expanded so the section reads well before any
  // hover (and on touch, before the first tap).
  const [active, setActive] = useState(0);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const first = useRef(true);

  // GSAP owns flex-grow. On mount we snap panels into place (no animation); on
  // every `active` change after that we tween the grow ratio.
  useIsoLayoutEffect(() => {
    panels.current.forEach((p, i) => {
      if (!p) return;
      const grow = i === active ? ACTIVE_GROW : INACTIVE_GROW;
      if (first.current) gsap.set(p, { flexGrow: grow });
      else gsap.to(p, { flexGrow: grow, duration: DURATION, ease: EASE });
    });
    first.current = false;
  }, [active]);

  return (
    <section ref={root} id="gallery" className="relative">
      <div
        ref={pin}
        className="flex min-h-[100svh] flex-col justify-start px-6 pb-[clamp(1.5rem,5vh,4rem)] pt-[clamp(5.5rem,11vh,6rem)] sm:px-12 md:h-[100svh] md:overflow-hidden lg:px-20"
      >
      {/* Header — same masked-line / fade vocabulary as the rest of the site. */}
      <div className="mb-[clamp(2rem,6vh,3.5rem)] max-w-3xl">
        <p className="reveal-fade mb-4 font-mono text-xs uppercase tracking-[0.25em] text-muted">
          Build log
        </p>
        <h2 className="font-display text-3xl leading-[1.15] tracking-tight sm:text-4xl lg:text-[clamp(2.25rem,5vh,3rem)]">
          <MaskLine>More of what I&apos;ve built.</MaskLine>
        </h2>
      </div>

      {/* md+ : the hover-expand accordion. Fills the height left under the
          header (md:flex-1) so panels fit the pinned screen without clipping. */}
      <div className="reveal-fade hidden md:flex md:min-h-0 md:w-full md:flex-1 md:items-stretch md:justify-center md:gap-2 md:max-h-[40rem]">
        {projects.map((project, i) => {
          const isActive = i === active;
          const repo =
            project.links.find((l) => /code|github/i.test(l.label))?.href ??
            project.links[0]?.href;
          return (
            <div
              key={project.slug}
              ref={(el) => {
                panels.current[i] = el;
              }}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`relative h-full min-w-0 grow basis-0 cursor-pointer overflow-hidden rounded-3xl border bg-foreground/[0.02] transition-[border-color,box-shadow] duration-500 ${
                isActive
                  ? "border-accent/60 shadow-[0_12px_45px_-12px_rgba(215,74,73,0.50),0_0_44px_-6px_rgba(215,74,73,0.42)]"
                  : "border-foreground/10"
              }`}
            >
              {/* Image (or a graceful fallback, mirroring Showcase). */}
              {project.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.image}
                  alt={`${project.title} preview`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-foreground/[0.06] to-foreground/[0.01]">
                  <span className="font-display text-4xl uppercase text-foreground/[0.08]">
                    {project.title}
                  </span>
                </div>
              )}

              {/* (A) Deep-teal wash over the image — a fixed colour so it darkens
                  in BOTH themes. Dim at rest for cohesion; lifts toward full
                  colour when the panel is active. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                style={{
                  backgroundColor: TINT,
                  opacity: isActive ? TINT_ACTIVE : TINT_REST,
                }}
              />

              {/* Text scrim — a dark bed localised to the bottom so the title and
                  tagline stay legible over ANY image, regardless of what's behind
                  them. Independent of the tint above; ramps in only on the active
                  panel (where the text shows). */}
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Spine label — the project name on the CLOSED bar, reading
                  bottom-to-top (writing-mode makes the flow vertical; rotate-180
                  flips it to run upward). Sits at the bottom of the bar and
                  fades out on the active panel, where the horizontal title in
                  the scrim takes over. Decorative: the real title lives in the
                  content block below, so this is aria-hidden. */}
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 bottom-6 flex justify-center transition-opacity duration-300 ${
                  isActive ? "opacity-0" : "opacity-100"
                }`}
              >
                <span className="rotate-180 whitespace-nowrap font-display text-[2.025rem] font-normal tracking-tight text-[#ece6d9] [word-spacing:0.3em] [writing-mode:vertical-rl]">
                  {project.title}
                </span>
              </div>

              {/* Content — fades in on the active panel; its width stays fixed so
                  the text doesn't reflow while the panel expands. */}
              <div
                className={`absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 [text-shadow:0_1px_10px_rgba(0,0,0,0.55)] transition-opacity duration-300 ${
                  isActive ? "opacity-100 delay-100" : "opacity-0"
                }`}
              >
                <div className="w-[20rem] max-w-full">
                  <div className="mb-1 flex items-center gap-3">
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-accent">
                      {project.category}
                    </p>
                    {project.status && STATUS_LABEL[project.status] && (
                      <span className="rounded-full border border-white/25 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-white/70">
                        {STATUS_LABEL[project.status]}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-2xl leading-tight text-white">
                    <MaskRevealUp key={`t-${isActive}`}>
                      {project.title}
                    </MaskRevealUp>
                  </h3>
                  <p className="mt-1 text-sm leading-snug text-white/70">
                    <MaskRevealUp key={`d-${isActive}`} delay={90}>
                      {project.tagline}
                    </MaskRevealUp>
                  </p>
                  <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white/60">
                    {project.tech.join("   •   ")}
                  </p>
                  {repo && (
                    <a
                      href={repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      onFocus={() => setActive(i)}
                      className="group mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white transition-colors hover:text-accent"
                    >
                      <span>View code</span>
                      <LaunchArrow />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Below md : the accordion doesn't fit, so fall back to a plain stack. */}
      <div className="flex flex-col gap-6 md:hidden">
        {projects.map((project) => {
          const repo =
            project.links.find((l) => /code|github/i.test(l.label))?.href ??
            project.links[0]?.href;
          return (
            <div
              key={project.slug}
              className="reveal-fade overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.02]"
            >
              <div className="relative aspect-[16/10] w-full">
                {project.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.image}
                    alt={`${project.title} preview`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-foreground/[0.06] to-foreground/[0.01]">
                    <span className="font-display text-3xl uppercase text-foreground/[0.08]">
                      {project.title}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="mb-1 flex items-center gap-3">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-accent">
                    {project.category}
                  </p>
                  {project.status && STATUS_LABEL[project.status] && (
                    <span className="rounded-full border border-foreground/25 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-muted">
                      {STATUS_LABEL[project.status]}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl text-foreground">
                  {project.title}
                </h3>
                <p className="mt-1 text-sm leading-snug text-muted">
                  {project.tagline}
                </p>
                {repo && (
                  <a
                    href={repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:text-accent"
                  >
                    <span>View code</span>
                    <LaunchArrow />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </section>
  );
}
