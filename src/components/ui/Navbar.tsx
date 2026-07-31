"use client";

import { useEffect, useRef, useState } from "react";
import { me } from "@/data/me";

/**
 * Navbar — global, fixed, solid-backed top nav.
 *
 * Behaviour:
 *  • Solid background so section content scrolls cleanly underneath (never
 *    bleeds through).
 *  • Auto-hide: slides up out of view on scroll-DOWN, returns on scroll-UP, when
 *    near the top of the page, or when the pointer approaches the top edge.
 *  • Desktop (md+): inline links. Mobile: the vertical "||||" hamburger toggles
 *    a dropdown panel (keyboard-operable via aria-expanded + real links).
 */
const NAV_LINKS = [
  { label: "Projects", href: "#gallery" },
  { label: "About Me", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

// px from the top within which the nav always stays visible / re-shows.
const TOP_ZONE = 80;

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

  // A hidden bar shouldn't leave the mobile dropdown floating open.
  useEffect(() => {
    if (hidden) setMenuOpen(false);
  }, [hidden]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[120] border-b border-white/10 bg-background transition-transform duration-300 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4 sm:px-12 lg:px-20">
        <a
          href="#showcase"
          className="font-display text-xl tracking-tight"
          aria-label={`${me.name} — home`}
        >
          AP
        </a>

        {/* Desktop links */}
        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-mono text-[0.8rem] uppercase tracking-[0.2em] text-muted transition-colors hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>

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

      {/* Mobile dropdown panel */}
      <div
        className={`overflow-hidden border-t border-white/10 transition-[max-height,opacity] duration-300 md:hidden ${
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col px-6 py-3">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={() => setMenuOpen(false)}
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
