"use client";

import { useEffect, useRef } from "react";

// The "noise" alphabet each character cycles through before it resolves.
const GLYPHS = "!<>-_\\/[]{}=+*^?#%&$@0123456789";

/**
 * Text scramble / "decode" effect — the thing GSAP's ScrambleText plugin does,
 * written by hand (that plugin is Club-only, so we don't have it).
 *
 * HOW IT WORKS: we never touch the DOM text char-by-char with timers. Instead
 * every character is assigned a random *resolve time* somewhere inside the total
 * duration. On each animation frame we rebuild the whole string: any character
 * whose resolve time has passed shows its real glyph, everything else shows a
 * random noise glyph. Because the resolve times are scattered, the word appears
 * to lock in from noise a few letters at a time — matching the recording, where
 * the HELLO copy flickered through `47%&@@03` before settling.
 *
 * Returns a ref you attach to the element whose `textContent` should animate.
 * Respects `prefers-reduced-motion` (shows the final text immediately).
 */
export function useScramble<T extends HTMLElement>(
  text: string,
  {
    delay = 0,
    duration = 1400,
    active = true,
  }: { delay?: number; duration?: number; active?: boolean } = {},
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!active || reduced) {
      el.textContent = text;
      return;
    }

    // Scatter each non-space character's resolve moment across the run so the
    // word locks in gradually rather than all at once.
    const chars = Array.from(text);
    const resolveAt = chars.map(
      () => duration * 0.25 + Math.random() * duration * 0.6,
    );

    const noise = () =>
      chars
        .map((ch) =>
          ch === " " || ch === "\n"
            ? ch
            : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        )
        .join("");

    // Show noise immediately (through any `delay`) so a staggered element never
    // flashes its real text before its turn to resolve comes up.
    el.textContent = noise();

    let raf = 0;
    let startTime = 0;
    let cancelled = false;

    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;

      let out = "";
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (ch === " " || ch === "\n") out += ch;
        else if (elapsed >= resolveAt[i]) out += ch;
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;

      if (elapsed < duration && !cancelled) {
        raf = requestAnimationFrame(tick);
      } else {
        el.textContent = text; // guarantee a clean final state
      }
    };

    const timer = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [text, delay, duration, active]);

  return ref;
}
