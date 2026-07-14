/**
 * LaunchArrow — the masked double-arrow used on "Visit Site" and the contact CTA.
 *
 * Two stacked ↗ glyphs inside a 1-char clip: on the PARENT's hover the top one
 * flies out the top-right corner while a fresh one slides up from the bottom-left
 * to replace it, so it reads as the arrow "launching". The parent must be a
 * `group` (this uses `group-hover:`); everything is sized in `em` so it scales
 * with the surrounding text.
 */
export function LaunchArrow() {
  return (
    <span
      aria-hidden
      className="relative -top-[0.08em] inline-flex h-[1.15em] w-[1.15em] items-center justify-center overflow-hidden text-[1.3em] leading-none"
    >
      <span className="absolute transition-transform duration-300 ease-out group-hover:-translate-y-[1.1em] group-hover:translate-x-[1.1em]">
        ↗
      </span>
      <span className="absolute -translate-x-[1.1em] translate-y-[1.1em] transition-transform duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0">
        ↗
      </span>
    </span>
  );
}
