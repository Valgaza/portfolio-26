"use client";

import { useRef } from "react";
import {
  siPython,
  siCplusplus,
  siJavascript,
  siOpencv,
  siHuggingface,
  siPytorch,
  siTensorflow,
  siFastapi,
  siFlask,
  siNextdotjs,
  siReact,
  siGit,
  siDocker,
  siPostgresql,
  siSupabase,
  siRedis,
} from "simple-icons";
import { me } from "@/data/me";
import { MaskLine, useScrollReveal, usePinSection } from "@/lib/animation/reveal";

/**
 * Skills — "My Stack". Two-column rhythm per category (big Anton label left,
 * the tools right), ported in spirit from Tajmirul's stack section but reskinned
 * to the light-industrial palette.
 *
 * HYBRID by necessity: about half the toolkit is concepts (RAG, NLP, DINOv2 …)
 * that have no logo. So each tool shows a monochrome brand mark ONLY if we have
 * one (see LOGOS) and falls back to the name alone otherwise — the logos land on
 * the product rows (Frameworks, Databases) and the concept rows read as clean
 * type. Marks are rendered in `currentColor` (ink, → accent on hover) so they
 * sit in the palette instead of dragging in a rainbow of brand colours.
 */

// Brand marks keyed by a normalised tool name (parenthetical notes stripped).
const LOGOS: Record<string, { path: string }> = {
  python: siPython,
  "c++": siCplusplus,
  javascript: siJavascript,
  opencv: siOpencv,
  "hugging face": siHuggingface,
  pytorch: siPytorch,
  tensorflow: siTensorflow,
  fastapi: siFastapi,
  flask: siFlask,
  "next.js": siNextdotjs,
  react: siReact,
  git: siGit,
  docker: siDocker,
  postgresql: siPostgresql,
  supabase: siSupabase,
  redis: siRedis,
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, " ")
    .trim();

export default function Skills() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  useScrollReveal(root);
  usePinSection(root, pin, { dwell: 0.6 });

  return (
    <section ref={root} id="skills" className="relative">
      <div
        ref={pin}
        className="flex min-h-screen flex-col justify-center px-6 py-32 sm:px-12 lg:px-20"
      >
      {/* Header */}
      <div className="mb-20 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-5">
          <p className="reveal-fade font-mono text-xs uppercase tracking-[0.35em] text-muted">
            Full Toolkit
          </p>
          <h2 className="font-display text-4xl uppercase tracking-tight sm:text-5xl lg:text-6xl">
            <MaskLine>My Stack</MaskLine>
          </h2>
        </div>
        <p className="reveal-fade max-w-xs text-lg leading-relaxed text-muted lg:text-right">
          Grouped by practice area — the same tools I use on production work and
          personal builds.
        </p>
      </div>

      {/* Category rows */}
      <div className="flex flex-col divide-y divide-white/10">
        {me.skills.map((group) => (
          <div
            key={group.category}
            className="reveal-fade grid gap-6 py-9 sm:grid-cols-12"
          >
            <h3 className="font-display text-2xl uppercase leading-none tracking-tight text-muted sm:col-span-4 sm:text-3xl lg:text-4xl">
              {group.category}
            </h3>

            <ul className="flex flex-wrap gap-x-8 gap-y-4 sm:col-span-8">
              {group.items.map((item) => {
                const icon = LOGOS[norm(item)];
                return (
                  <li
                    key={item}
                    className="group flex items-center gap-2.5 leading-none"
                  >
                    {icon ? (
                      <svg
                        role="img"
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="h-[1.15em] w-[1.15em] shrink-0 fill-current text-muted transition-colors duration-200 group-hover:text-accent"
                      >
                        <path d={icon.path} />
                      </svg>
                    ) : null}
                    <span className="text-xl text-foreground transition-colors duration-200 group-hover:text-accent">
                      {item}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
