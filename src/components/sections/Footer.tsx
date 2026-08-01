"use client";

import { useEffect, useState } from "react";
import { me } from "@/data/me";

// Live "local time" clock in IST, formatted HH:MM:SS. We only start rendering
// the value after mount so the server and client don't disagree on the second
// (which would be a hydration mismatch).
function useISTClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return time;
}

const LINK_CLASS =
  "cursor-pointer font-mono text-[0.8rem] uppercase tracking-[0.15em] text-muted transition-colors hover:text-accent";

// Smooth-scroll to the very top via Lenis (the same instance the navbar uses,
// exposed on window). Falls back to native smooth scroll if Lenis isn't ready.
function scrollToTop() {
  const lenis = (
    window as unknown as {
      lenis?: { scrollTo: (t: number, o?: { duration?: number }) => void };
    }
  ).lenis;
  if (lenis) lenis.scrollTo(0, { duration: 1.2 });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function Footer() {
  const time = useISTClock();
  const linkedIn = me.socials.find((s) => s.label === "LinkedIn")?.href ?? "#";
  const github = me.socials.find((s) => s.label === "GitHub")?.href ?? "#";
  const instagram =
    me.socials.find((s) => s.label === "Instagram")?.href ?? "#";

  return (
    <footer className="flex flex-col overflow-hidden px-6 pb-10 pt-16 sm:px-12 lg:px-20">
      <div className="h-px w-full bg-foreground/15" />

      <div className="grid grid-cols-1 gap-8 py-10 sm:grid-cols-3">
        {/* Contact links */}
        <div className="flex flex-col gap-3">
          <a href={`mailto:${me.email}`} className={LINK_CLASS}>
            {me.email}
          </a>
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_CLASS}
          >
            GitHub
          </a>
          <a
            href={linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_CLASS}
          >
            LinkedIn
          </a>
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_CLASS}
          >
            Instagram
          </a>
        </div>

        {/* Back to top — centred */}
        <div className="flex flex-col gap-3 sm:items-center">
          <button
            type="button"
            onClick={scrollToTop}
            className={`${LINK_CLASS} text-center`}
          >
            Back to top
          </button>
        </div>

        {/* Personal sign-off + local time */}
        <div className="flex flex-col gap-3 sm:text-right">
          <span className="font-mono text-[0.8rem] uppercase tracking-[0.35em] text-foreground">
            No regrets
          </span>
          <span className="font-mono text-[0.8rem] uppercase tracking-[0.15em] tabular-nums text-muted">
            IST — {time ?? "--:--:--"}
          </span>
        </div>
      </div>

      {/* Oversized name wordmark — decorative. Its glyphs overflow this box
          upward (leading-[0.8]) and overlap the links row above; since it paints
          on top, it would otherwise steal hover/selection from those links. It's
          purely decorative, so make it inert to pointer + selection. */}
      <div
        aria-hidden
        className="pointer-events-none mt-8 select-none font-display text-[13vw] uppercase leading-[0.8] tracking-tight text-foreground"
      >
        {me.name}
      </div>
    </footer>
  );
}
