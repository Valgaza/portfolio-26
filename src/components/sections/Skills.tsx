"use client";

import { useRef } from "react";
import { me } from "@/data/me";
import { MaskLine, useScrollReveal } from "@/lib/animation/reveal";

/**
 * Skills — the toolkit grid. A plain scroll-reveal section (heading rises out of
 * a clip, groups fade + slide up), same vocabulary as About/Contact. It used to
 * be fused with Experience into one pinned chapter; now it stands on its own,
 * after the project gallery.
 */

// Outlined skill pill. On hover it lifts, its border turns neon, the text
// brightens, and a soft accent glow blooms behind it.
const CHIP_CLASS =
  "cursor-default whitespace-nowrap rounded-full border border-white/10 px-4 py-2 font-mono text-sm uppercase tracking-[0.1em] text-muted transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-accent/60 hover:text-foreground hover:shadow-[0_0_22px_-6px_var(--accent)]";

export default function Skills() {
  const root = useRef<HTMLElement>(null);
  useScrollReveal(root);

  return (
    <section
      ref={root}
      id="skills"
      className="flex min-h-screen flex-col justify-center px-6 py-32 sm:px-12 md:px-12 lg:px-20"
    >
      {/* Header */}
      <div className="mb-16 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
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
      <div className="grid w-full grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {me.skills.map((group) => (
          <div key={group.category} className="reveal-fade flex flex-col gap-5">
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
    </section>
  );
}
