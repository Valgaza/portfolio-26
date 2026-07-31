"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import type { Project } from "@/data/me";
import { MaskLine, useScrollReveal, useIsoLayoutEffect } from "@/lib/animation/reveal";
import { LaunchArrow } from "@/components/ui/LaunchArrow";

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

// Panel sizing — tweak here. ACTIVE/INACTIVE are flex-basis widths on md+.
const ACTIVE = "24rem";
const INACTIVE = "5rem";
// Motion — matches the reference's easeInOut ~0.3s. Bump DURATION for a slower,
// more languid expand.
const DURATION = 0.4;
const EASE = "power2.inOut";

// Non-"live" projects get a small badge. `undefined`/"live" = no badge.
const STATUS_LABEL: Record<string, string> = {
  "in-progress": "In progress",
  research: "Research",
};

export default function ProjectGallery({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  useScrollReveal(root);

  // Start with the first panel expanded so the section reads well before any
  // hover (and on touch, before the first tap).
  const [active, setActive] = useState(0);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const first = useRef(true);

  // GSAP owns flex-basis. On mount we snap panels into place (no animation);
  // on every `active` change after that we tween them.
  useIsoLayoutEffect(() => {
    panels.current.forEach((p, i) => {
      if (!p) return;
      const basis = i === active ? ACTIVE : INACTIVE;
      if (first.current) gsap.set(p, { flexBasis: basis });
      else gsap.to(p, { flexBasis: basis, duration: DURATION, ease: EASE });
    });
    first.current = false;
  }, [active]);

  return (
    <section
      ref={root}
      id="gallery"
      className="flex min-h-screen flex-col justify-center px-6 py-32 sm:px-12 lg:px-20"
    >
      {/* Header — same masked-line / fade vocabulary as the rest of the site. */}
      <div className="mb-14 max-w-3xl">
        <p className="reveal-fade mb-4 font-mono text-xs uppercase tracking-[0.25em] text-muted">
          Build log
        </p>
        <h2 className="text-3xl font-medium leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">
          <MaskLine>More of what I&apos;ve built.</MaskLine>
        </h2>
      </div>

      {/* md+ : the hover-expand accordion. */}
      <div className="reveal-fade hidden md:flex md:w-full md:items-center md:justify-center md:gap-2">
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
              className="relative h-[24rem] flex-none cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]"
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
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/[0.06] to-white/[0.01]">
                  <span className="font-display text-4xl uppercase text-white/[0.08]">
                    {project.title}
                  </span>
                </div>
              )}

              {/* Bottom scrim — only visible on the active panel. */}
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Content — fades in on the active panel; its width stays fixed so
                  the text doesn't reflow while the panel expands. */}
              <div
                className={`absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 transition-opacity duration-300 ${
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
                  <h3 className="text-2xl font-medium leading-tight text-white">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-sm leading-snug text-white/70">
                    {project.tagline}
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
              className="reveal-fade overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
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
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/[0.06] to-white/[0.01]">
                    <span className="font-display text-3xl uppercase text-white/[0.08]">
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
                    <span className="rounded-full border border-white/25 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-muted">
                      {STATUS_LABEL[project.status]}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-medium text-foreground">
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
    </section>
  );
}
