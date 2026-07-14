"use client";

import { useRef } from "react";
import { me } from "@/data/me";
import { MaskLine, useScrollReveal } from "@/lib/animation/reveal";
import { LaunchArrow } from "@/components/ui/LaunchArrow";

/**
 * Contact — the closing call to action. Reuses the shared masked-line reveal
 * (heading rises out of a clip) plus a `.reveal-fade` for the CTA, so it behaves
 * exactly like About/Projects when it scrolls into view.
 */
export default function Contact() {
  const root = useRef<HTMLElement>(null);
  useScrollReveal(root);

  return (
    <section
      ref={root}
      id="contact"
      className="flex min-h-screen flex-col justify-center px-6 py-32 sm:px-12 lg:px-20"
    >
      <h2 className="max-w-3xl text-3xl font-medium leading-[1.3] tracking-tight sm:text-4xl lg:text-5xl">
        <MaskLine>Let&apos;s build and ship something remarkable.</MaskLine>
        <MaskLine>
          Open to AI/ML internships, research collaborations, and full-time
          roles.
        </MaskLine>
      </h2>

      <div className="reveal-fade mt-14">
        <a
          href={`mailto:${me.email}`}
          className="group inline-flex items-center gap-3 font-mono text-sm uppercase tracking-[0.2em] text-foreground transition-colors hover:text-accent"
        >
          <span
            aria-hidden
            className="text-muted transition-all duration-300 ease-out group-hover:-translate-x-2 group-hover:text-accent"
          >
            (
          </span>
          <span className="px-1 transition-colors group-hover:text-accent">
            Let&apos;s work together
          </span>
          <LaunchArrow />
          <span
            aria-hidden
            className="text-muted transition-all duration-300 ease-out group-hover:translate-x-2 group-hover:text-accent"
          >
            )
          </span>
        </a>
      </div>
    </section>
  );
}
