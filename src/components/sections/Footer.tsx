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
  "font-mono text-[0.8rem] uppercase tracking-[0.15em] text-muted transition-colors hover:text-accent";

export default function Footer() {
  const time = useISTClock();
  const linkedIn = me.socials.find((s) => s.label === "LinkedIn")?.href ?? "#";
  const github = me.socials.find((s) => s.label === "GitHub")?.href ?? "#";

  return (
    <footer className="flex flex-col overflow-hidden px-6 pb-10 pt-24 sm:px-12 lg:px-20">
      <div className="h-px w-full bg-black/15" />

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
        </div>

        {/* Utilities */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[0.8rem] uppercase tracking-[0.15em] tabular-nums text-muted">
            IST — {time ?? "--:--:--"}
          </span>
          <a href="#showcase" className={LINK_CLASS}>
            Back to top
          </a>
        </div>

        {/* Attribution — this is a design-to-code STUDY of someone else's work,
            so the original designer is credited here, prominently. */}
        <div className="flex flex-col gap-3 sm:text-right">
          <span className="font-mono text-[0.8rem] uppercase tracking-[0.15em] text-muted">
            Design by Roshan Sahu &amp; Rekhchand
          </span>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted">
            Design-to-code study · rebuilt for learning
          </span>
        </div>
      </div>

      {/* Oversized name wordmark */}
      <div className="mt-8 font-display text-[13vw] uppercase leading-[0.8] tracking-tight text-foreground">
        {me.name}
      </div>
    </footer>
  );
}
