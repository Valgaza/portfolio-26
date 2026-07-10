"use client";

import { useRef } from "react";
import { me } from "@/data/me";
import { MaskLine, useScrollReveal } from "@/lib/animation/reveal";

// Split the bio into sentences so each reveals as its own masked line, one
// after another. Keeps the trailing punctuation on each sentence.
const bioSentences = me.bio
  .split(/(?<=\.)\s+/)
  .map((s) => s.trim())
  .filter(Boolean);

export default function About() {
  const root = useRef<HTMLElement>(null);
  useScrollReveal(root);

  return (
    <section
      ref={root}
      id="about"
      className="flex min-h-screen flex-col justify-center gap-12 px-6 py-24 sm:px-12 lg:px-20"
    >
      <p className="reveal-fade font-mono text-sm uppercase tracking-[0.25em] text-accent">
        About
      </p>

      <h2 className="max-w-4xl text-3xl font-medium leading-[1.25] tracking-tight sm:text-4xl lg:text-5xl">
        {bioSentences.map((sentence, i) => (
          <MaskLine key={i}>{sentence} </MaskLine>
        ))}
      </h2>

      {/* Detail row — fades up after the sentences have risen. */}
      <dl className="reveal-fade grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 text-sm sm:grid-cols-4">
        {[
          ["Degree", me.degree],
          ["College", me.college],
          ["Class of", me.gradYear],
          ["Based in", me.location],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1">
            <dt className="font-mono uppercase tracking-wider text-muted">
              {label}
            </dt>
            <dd className="text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
