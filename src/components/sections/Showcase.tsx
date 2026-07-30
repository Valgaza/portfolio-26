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
 * plays its own reveal as the curtain lifts (hence the intro delay).
 *
 * The nav is a fixed, always-visible header — real links, keyboard-operable
 * (the old hover-only "||||" menu is gone).
 */
const NAV_LINKS = [
  { label: "Projects", href: "#gallery" },
  { label: "About Me", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

// Placeholder metrics — real numbers from the CV; copy tuned later.
const STATS = [
  { value: "9.32", label: "CGPA" },
  { value: "3", label: "AI/ML internships" },
  { value: "1600+", label: "LeetCode rating" },
];

export default function Showcase() {
  const root = useRef<HTMLElement>(null);
  const first = me.name.split(" ")[0];

  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Start as the Preloader bars begin dropping (~1.6s in) so the hero
      // resolves into view exactly as the curtain lifts.
      const tl = gsap.timeline({ delay: 1.6 });

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
      {/* Fixed nav — always visible, keyboard-operable. */}
      <header className="fixed inset-x-0 top-0 z-[120] flex items-center justify-between px-6 py-6 sm:px-12 lg:px-20">
        <a
          href="#showcase"
          className="font-display text-xl tracking-tight"
          aria-label={`${me.name} — home`}
        >
          AP
        </a>
        <nav className="flex items-center gap-5 sm:gap-9">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-muted transition-colors hover:text-accent sm:text-[0.8rem]"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      {/* Hero body */}
      <div className="flex min-h-svh flex-col justify-center px-6 pb-16 pt-32 sm:px-12 lg:px-20">
        <div className="flex flex-1 flex-col justify-center gap-14 lg:flex-row lg:items-end lg:justify-between">
          {/* Left — headline + copy */}
          <div className="max-w-2xl">
            <p className="hero-fade mb-6 font-mono text-xs uppercase tracking-[0.3em] text-muted">
              {me.location} · Available for AI/ML roles
            </p>

            <h1 className="font-display text-[clamp(2.75rem,9vw,8rem)] uppercase leading-[0.88] tracking-tight">
              <span className="block overflow-hidden pb-[0.04em]">
                <span className="hero-line block text-accent">AI / ML</span>
              </span>
              <span className="block overflow-hidden pb-[0.08em]">
                <span className="hero-line block">Developer</span>
              </span>
            </h1>

            <p className="hero-fade mt-8 max-w-md text-lg leading-relaxed text-muted">
              Hi, I&apos;m {first} — I build AI systems that make it to
              production: retrieval-augmented platforms, computer-vision
              pipelines, and NLP tooling.
            </p>

            <div className="hero-fade mt-9 flex flex-wrap items-center gap-6">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-background transition-colors hover:bg-accent hover:text-on-accent"
              >
                Let&apos;s talk
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
          <dl className="flex gap-10 sm:gap-14 lg:flex-col lg:gap-8 lg:text-right">
            {STATS.map((s) => (
              <div key={s.label} className="hero-fade">
                <dt className="font-display text-4xl leading-none tracking-tight text-accent sm:text-5xl">
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
    </section>
  );
}
