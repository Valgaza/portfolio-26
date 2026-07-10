"use client";

import { useRef } from "react";
import { me } from "@/data/me";
import { MaskLine, useScrollReveal } from "@/lib/animation/reveal";
import ProjectCard from "@/components/ui/ProjectCard";

/**
 * Projects. Uses the same reveal convention as About: a masked-line heading
 * plus `.reveal-fade` elements — here each card is a `.reveal-fade`, so when the
 * section scrolls into view the heading rises and the cards fade up in a
 * stagger (the stagger comes for free from useScrollReveal, which animates all
 * `.reveal-fade` nodes together with an offset).
 */
export default function Projects() {
  const root = useRef<HTMLElement>(null);
  useScrollReveal(root);

  return (
    <section
      ref={root}
      id="projects"
      className="flex min-h-screen flex-col justify-center gap-12 px-6 py-24 sm:px-12 lg:px-20"
    >
      <div className="flex flex-col gap-4">
        <p className="reveal-fade font-mono text-sm uppercase tracking-[0.25em] text-accent">
          Projects
        </p>
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          <MaskLine>Things I&apos;ve built.</MaskLine>
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {me.projects.map((project) => (
          // Each card is a reveal target; the wrapper carries the animation
          // class so the card component itself stays purely presentational.
          <div key={project.slug} className="reveal-fade h-full">
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </section>
  );
}
