"use client";

import { useEffect, useRef, useState } from "react";
import { me } from "@/data/me";
import ThemeToggle from "@/components/ui/ThemeToggle";

/**
 * Navbar — global, fixed, solid-backed top nav.
 *
 * Behaviour:
 *  • Solid background so section content scrolls cleanly underneath.
 *  • Auto-hide: slides up on scroll-DOWN, returns on scroll-UP, near the top of
 *    the page, or when the pointer approaches the top edge.
 *  • Links + the AP logo smooth-scroll via the Lenis instance (exposed on
 *    window by SmoothScrollProvider); they stay real anchors/buttons so
 *    keyboard + no-JS still work.
 *  • Desktop (md+): inline links. Mobile: the vertical "||||" hamburger toggles
 *    a dropdown.
 */
const NAV_LINKS = [
  { label: "Experience", href: "#experience" },
  { label: "Build Log", href: "#gallery" },
  { label: "Stack", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

// px from the top within which the nav always stays visible / re-shows.
const TOP_ZONE = 80;

type LenisLike = {
  scrollTo: (target: HTMLElement | number | string) => void;
};

function smoothScroll(target: string | number) {
  const lenis = (window as unknown as { lenis?: LenisLike }).lenis;
  if (typeof target === "number") {
    if (lenis) lenis.scrollTo(target);
    else window.scrollTo({ top: target, behavior: "smooth" });
    return;
  }
  const el = document.querySelector<HTMLElement>(target);
  if (!el) return;
  if (lenis) lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: "smooth" });
}

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < TOP_ZONE) setHidden(false);
      else if (y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4) setHidden(false);
      lastY.current = y;
    };
    const onMove = (e: MouseEvent) => {
      if (e.clientY < TOP_ZONE) setHidden(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  useEffect(() => {
    if (hidden) setMenuOpen(false);
  }, [hidden]);

  const go = (href: string) => {
    smoothScroll(href);
    setMenuOpen(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[120] border-b border-foreground/10 bg-background transition-transform duration-300 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4 sm:px-12 lg:px-20">
        <button
          type="button"
          onClick={() => smoothScroll(0)}
          className="font-display text-xl tracking-tight transition-colors hover:text-accent"
          aria-label={`${me.name} — back to top`}
        >
          AP
        </button>

        <div className="flex items-center gap-4 md:gap-6">
          {/* Desktop links */}
          <nav className="hidden items-center gap-9 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  go(link.href);
                }}
                className="font-mono text-[0.8rem] uppercase tracking-[0.2em] text-muted transition-colors hover:text-accent"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <ThemeToggle />

          {/* Mobile: the "||||" hamburger */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-[4px] p-2 md:hidden"
          >
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`w-[2px] bg-foreground transition-[height,background-color] duration-300 ${
                  menuOpen ? "h-6 bg-accent" : "h-5"
                }`}
              />
            ))}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      <div
        className={`overflow-hidden border-t border-foreground/10 transition-[max-height,opacity] duration-300 md:hidden ${
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col px-6 py-3">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  go(link.href);
                }}
                className="block py-2.5 font-mono text-sm uppercase tracking-[0.22em] text-foreground/90 transition-colors hover:text-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
