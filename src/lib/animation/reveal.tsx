"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// useLayoutEffect on the client (measure before paint = no flash of the
// pre-animation state), plain useEffect on the server to avoid SSR warnings.
export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Masked-line primitive — the reusable core of our line-reveal effect.
 *
 * The outer span clips (`overflow-hidden`); the inner span (`.mask-line__inner`)
 * is the element animations move. Parking the inner span at `yPercent: 110` and
 * tweening it to `0` makes the line rise up out of the clip. Every reveal in the
 * site targets the `.mask-line__inner` class, so any section can opt in just by
 * wrapping text in <MaskLine>.
 *
 * `pb-[0.1em]` leaves room for descenders (g, y, p) so they aren't clipped when
 * the line is at rest.
 */
export function MaskLine({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`mask-line block overflow-hidden pb-[0.1em] ${className}`}>
      <span className="mask-line__inner block">{children}</span>
    </span>
  );
}

/**
 * Scroll-triggered reveal for a whole section.
 *
 * Call it with a ref to the section's root. When that root scrolls to `start`
 * (default: its top hits 85% down the viewport), it plays a single timeline:
 *   1. any <MaskLine> children rise up (staggered), then
 *   2. any `.reveal-fade` elements fade + slide up.
 *
 * THIS is where the Lenis↔ScrollTrigger wiring from step 2 pays off: because
 * ScrollTrigger is fed Lenis's virtualized scroll position, the reveal fires at
 * the correct on-screen moment even though Lenis is interpolating the scroll.
 *
 * `once: true` means it plays a single time (doesn't replay on scroll-back).
 * Everything is scoped with `gsap.context(scope)` so selectors stay local to
 * the section and `ctx.revert()` tears it all down on unmount.
 */
export function useScrollReveal(
  scope: RefObject<HTMLElement | null>,
  {
    start = "top 85%",
    stagger = 0.1,
  }: { start?: string; stagger?: number } = {},
) {
  useIsoLayoutEffect(() => {
    if (!scope.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: scope.current!, start, once: true },
      });

      const lines = gsap.utils.toArray<HTMLElement>(
        ".mask-line__inner",
        scope.current!,
      );
      if (lines.length) {
        gsap.set(lines, { yPercent: 110 });
        tl.to(lines, {
          yPercent: 0,
          duration: 1,
          ease: "power4.out",
          stagger,
        });
      }

      const fades = gsap.utils.toArray<HTMLElement>(
        ".reveal-fade",
        scope.current!,
      );
      if (fades.length) {
        tl.from(
          fades,
          { autoAlpha: 0, y: 20, duration: 0.8, ease: "power2.out", stagger },
          // overlap the fades with the tail of the line reveal (or start at 0
          // if there were no lines).
          lines.length ? "-=0.6" : 0,
        );
      }
    }, scope);

    return () => ctx.revert();
  }, [scope, start, stagger]);
}
