"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { me } from "@/data/me";
import { useIsoLayoutEffect } from "@/lib/animation/reveal";
import { LaunchArrow } from "@/components/ui/LaunchArrow";

/**
 * Showcase — the landing hero. Big-type headline + description + CTA on the left,
 * a stat block on the right. Replaces the old pinned photo-grow → bio-stream →
 * stacking-cards sequence (the most "inherited" part of the old design). The
 * Preloader curtain (see components/ui/Preloader) covers the load; this section
 * plays its own reveal as the curtain lifts (hence the intro delay). The nav
 * lives in the global <Navbar /> (mounted in layout), not here.
 */

// Placeholder metrics — real numbers from the CV; copy tuned later.
const STATS = [
  { value: "21 Yrs", label: "Uptime" },
  { value: "Mumbai, India", label: "Home" },
  { value: "CSE Final Year", label: "@KJSCE" },
];

// Résumé link — opens in a new tab. NOTE: the CV in the repo root is gitignored
// ("do not publish"), so point this at either a public copy dropped in
// `public/` (e.g. "/AaryaPatil_Resume.pdf") or a hosted link (Google Drive…).
const RESUME_URL = "/AaryaPatil_CV.pdf";

export default function Showcase() {
  const root = useRef<HTMLElement>(null);
  const first = me.name.split(" ")[0];

  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Start as the Preloader bars begin dropping (~1.8s in) so the hero
      // resolves into view exactly as the curtain lifts.
      const tl = gsap.timeline({ delay: 1.8 });

      const lines = gsap.utils.toArray<HTMLElement>(".hero-line", root.current!);
      gsap.set(lines, { yPercent: 115 });
      tl.to(lines, {
        yPercent: 0,
        duration: 1,
        ease: "power4.out",
        stagger: 0.12,
      });
      tl.from(
        ".hero-fade",
        {
          autoAlpha: 0,
          y: 20,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.08,
        },
        "-=0.55",
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="showcase" className="relative min-h-svh">
      {/* Hero body (the nav is the global <Navbar />, mounted in layout) */}
      <div className="flex min-h-svh flex-col justify-center px-6 pb-16 pt-32 sm:px-12 sm:pt-48 lg:px-20 lg:pt-120">
        <div className="flex flex-1 flex-col justify-center">
          <p className="hero-fade mb-8 font-mono text-xs uppercase tracking-[0.3em] text-muted">
            Jack of it all, master of some.
          </p>

          {/* The headline and the stat block share this row; on lg they align at
              the TOP so the stats start level with the "AI / ML" headline. */}
          <div className="flex flex-col gap-14 lg:flex-row lg:items-start lg:justify-between">
          {/* Left — headline + copy */}
          <div className="max-w-2xl">
            <h1 className="font-display text-[clamp(2.5rem,5.5vw,4.5rem)] uppercase leading-[0.9] tracking-tight">
              <span className="block overflow-hidden pb-[0.04em]">
                <span className="hero-line block text-accent">Software</span>
              </span>
              <span className="block overflow-hidden pb-[0.08em]">
                <span className="hero-line block">Engineer</span>
              </span>
            </h1>

            <p className="hero-fade mt-5 max-w-md text-xl leading-relaxed text-muted">
              Hi, I&apos;m {first}. I build systems that solve problems and look good doing it. Comfortable across AI, ML, full-stack, and data, but right now I'm going a few layers deeper into ML.
            </p>

            <div className="hero-fade mt-9 flex flex-wrap items-center gap-6">
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-background transition-colors hover:bg-accent hover:text-on-accent"
              >
                My resume
                <LaunchArrow />
              </a>
              <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-muted">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                Open to work
              </span>
            </div>
          </div>

          {/* Right — stat block */}
          <dl className="flex flex-wrap gap-x-10 gap-y-5 sm:gap-x-14 lg:flex-col lg:gap-8 lg:text-right">
            {STATS.map((s) => (
              <div key={s.label} className="hero-fade">
                <dt className="font-display text-3xl leading-none tracking-tight text-accent sm:text-4xl lg:text-5xl">
                  {s.value}
                </dt>
                <dd className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-muted">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
