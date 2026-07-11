"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { me, type Project } from "@/data/me";
import { useIsoLayoutEffect } from "@/lib/animation/reveal";
import { useScramble } from "@/lib/animation/useScramble";

const NAV_LINKS = [
  { label: "Projects", href: "#showcase" },
  { label: "About Me", href: "#showcase" },
  { label: "Services", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

const bioWords = me.bio.split(" ");
const total = String(me.projects.length).padStart(2, "0");

// Scroll "budget" (abstract timeline units) per phase for the pinned scroll.
const UNIT_PHOTO = 1;
const UNIT_BIO = 2.5;
const UNIT_CARD = 1;
const SCROLL_PER_UNIT = 0.7;

const FRAME_MARGIN = 12; // px — matches `inset-3` on the cards
const PREV_CARD_SCALE = 0.92; // how much a covered card recedes

// Intro (load) palette — GSAP can't tween CSS vars, so use the raw hexes.
const YELLOW = "#e9e400";
const WHITE = "#f4f4ef";

/** A nav link whose text scrambles/decodes in, on a per-link delay. */
function NavLink({
  label,
  href,
  delay,
}: {
  label: string;
  href: string;
  delay: number;
}) {
  const ref = useScramble<HTMLAnchorElement>(label, { delay, duration: 700 });
  return (
    <a
      ref={ref}
      href={href}
      className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
    >
      {label}
    </a>
  );
}

/** The two-column body shared by every project card (and the reduced layout). */
function PanelContent({ project }: { project: Project }) {
  return (
    <div className="grid h-full w-full items-center gap-10 px-8 py-16 sm:px-14 lg:grid-cols-2 lg:px-20">
      <div className="order-2 flex flex-col gap-6 lg:order-1">
        <h3 className="font-display text-5xl uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-8xl">
          {project.title}
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-muted sm:text-base">
          {project.description}
        </p>
        <div>
          {project.status === "in-progress" ? (
            <span className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
              <span aria-hidden>(</span>In Progress<span aria-hidden>)</span>
            </span>
          ) : (
            <a
              href={project.links[0]?.href ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-foreground"
            >
              <span aria-hidden className="text-muted">
                (
              </span>
              Visit Site
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                ↗
              </span>
              <span aria-hidden className="text-muted">
                )
              </span>
            </a>
          )}
        </div>
      </div>

      <div className="order-1 flex flex-col gap-6 lg:order-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground">
            {project.category}
          </p>
          <div className="my-3 h-px w-full bg-white/15" />
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-muted">
            {project.tech.join("  •  ")}
          </p>
        </div>
        <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.01]">
          <span className="absolute font-display text-5xl uppercase text-white/[0.04] sm:text-7xl">
            {project.title}
          </span>
          <span className="relative font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted">
            {project.title} preview
          </span>
        </div>
      </div>
    </div>
  );
}

function CounterBadge({ index }: { index: number }) {
  return (
    <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border border-white/20 bg-background/40 backdrop-blur-sm">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted">
        Project
      </span>
      <span className="font-mono text-sm tracking-widest">
        <span className="text-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-muted"> | {total}</span>
      </span>
    </div>
  );
}

/**
 * Showcase — the load intro + the continuous pinned opening.
 *
 * TWO timelines, on purpose:
 *  • The INTRO runs once on load (deps []): preloader clears → hero fades in →
 *    nav links decode (via <NavLink>) → the wordmark springs up in yellow →
 *    settles to white (revealing the yellow echo-shadow). It must NOT replay on
 *    resize, hence its own effect.
 *  • The SCROLL timeline (deps [rev]) pins the section and drives photo-grow →
 *    bio stream → stacking cards, and is rebuilt on resize to re-measure the
 *    slot/frame geometry.
 */
export default function Showcase() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [rev, setRev] = useState(0);

  const helloText = `I'm ${me.name}, a ${me.role}. Welcome to my portfolio!`;
  const scrambleRef = useScramble<HTMLParagraphElement>(helloText, {
    delay: 1900,
    duration: 1100,
  });

  // Debounced resize → re-init the scroll geometry.
  useEffect(() => {
    let t: number;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setRev((r) => r + 1), 250);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
  }, []);

  // ---- INTRO (runs once) ---------------------------------------------------
  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      window.scrollTo(0, 0);

      // Pre-states: hero hidden, wordmark parked below its clip and yellow.
      gsap.set(".sc-hero-fade", { autoAlpha: 0 });
      gsap.set(".sc-word", { yPercent: 120, color: YELLOW });

      const tl = gsap.timeline();
      tl.to(".sc-loading", { autoAlpha: 0, duration: 0.3, ease: "power1.out" }, 1.4);
      tl.to(
        ".sc-preloader",
        { yPercent: -100, duration: 0.7, ease: "power3.inOut" },
        1.6,
      );
      tl.to(
        ".sc-hero-fade",
        { autoAlpha: 1, duration: 0.6, ease: "power2.out" },
        1.8,
      );
      // Wordmark springs up (overshoot ≈ the measured spring bezier).
      tl.to(
        ".sc-word",
        { yPercent: 0, duration: 1.0, ease: "back.out(1.6)", stagger: 0.12 },
        1.9,
      );
      // Yellow → white settle (measured ease-in-out); the echo-shadow stays.
      tl.to(
        ".sc-word",
        { color: WHITE, duration: 0.9, ease: "power2.inOut", stagger: 0.1 },
        2.9,
      );
    }, root);

    return () => ctx.revert();
  }, []);

  // ---- SCROLL (rebuilds on resize) -----------------------------------------
  useIsoLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      return;
    }

    const n = me.projects.length;
    const timelineTotal = UNIT_PHOTO + UNIT_BIO + n * UNIT_CARD;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(
        ".project-card",
        root.current,
      );
      const photoEl = root.current!.querySelector<HTMLElement>(".sc-photo")!;
      const slotEl = root.current!.querySelector<HTMLElement>(".sc-photo-slot")!;
      const pinBox = pin.current!.getBoundingClientRect();
      const slotBox = slotEl.getBoundingClientRect();

      const startGeo = {
        top: slotBox.top - pinBox.top,
        left: slotBox.left - pinBox.left,
        width: slotBox.width,
        height: slotBox.height,
      };
      const endGeo = {
        top: FRAME_MARGIN,
        left: FRAME_MARGIN,
        width: pinBox.width - FRAME_MARGIN * 2,
        height: pinBox.height - FRAME_MARGIN * 2,
      };

      gsap.set(photoEl, startGeo);
      gsap.set(".sc-bio", { autoAlpha: 0 });
      gsap.set(".sc-bio-word", { opacity: 0.14 });
      // Counter starts a full card-height below its spot, so it can ride the
      // first card up from the very bottom as if it's part of that card.
      gsap.set(".sc-counter", { autoAlpha: 0, y: endGeo.height });
      gsap.set(cards, { yPercent: 100 });
      gsap.set(".sc-card-content", { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () =>
            "+=" + timelineTotal * SCROLL_PER_UNIT * window.innerHeight,
          pin: pin.current,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const t = self.progress * timelineTotal;
            const projectsStart = UNIT_PHOTO + UNIT_BIO;
            if (t < projectsStart) return;
            const idx = Math.min(
              n - 1,
              Math.floor((t - projectsStart) / UNIT_CARD),
            );
            setActive(idx);
          },
        },
      });

      tl.to(photoEl, { ...endGeo, duration: UNIT_PHOTO }, 0);
      // The hero (card + words + nav) scrolls UP and out over the growing photo
      // — the photo sits in front of it (higher z), so the text slides up behind
      // the expanding image and exits the top just as it fills. It never fades.
      tl.to(
        [".sc-headline", ".sc-nav"],
        { yPercent: -110, duration: UNIT_PHOTO },
        0,
      );

      const perWord = UNIT_BIO / bioWords.length;
      tl.to(".sc-bio", { autoAlpha: 1, duration: 0.15 }, UNIT_PHOTO);
      tl.to(
        ".sc-bio-word",
        { opacity: 1, duration: perWord, stagger: perWord },
        UNIT_PHOTO,
      );

      const projectsStart = UNIT_PHOTO + UNIT_BIO;
      // Counter appears (off-screen at the card's bottom) and rides the full
      // card height up into its spot — locked to the first card's slide — then
      // persists there while later cards come and go.
      tl.set(".sc-counter", { autoAlpha: 1 }, projectsStart);
      tl.to(".sc-counter", { y: 0, duration: UNIT_CARD }, projectsStart);
      cards.forEach((card, i) => {
        const at = projectsStart + i * UNIT_CARD;
        const content = card.querySelector(".sc-card-content");
        tl.to(card, { yPercent: 0, duration: UNIT_CARD }, at);
        tl.to(
          content,
          { autoAlpha: 1, duration: UNIT_CARD * 0.6 },
          at + UNIT_CARD * 0.25,
        );
        if (i > 0) {
          const prev = cards[i - 1];
          tl.to(
            prev.querySelector(".sc-card-content"),
            { autoAlpha: 0, duration: UNIT_CARD * 0.4 },
            at,
          );
          tl.to(prev, { scale: PREV_CARD_SCALE, duration: UNIT_CARD }, at);
        }
      });
    }, root);

    return () => ctx.revert();
  }, [rev]);

  // ---- Reduced-motion fallback: everything stacked, static.
  if (reduced) {
    return (
      <section id="showcase" className="flex flex-col">
        <div className="flex min-h-screen flex-col justify-center gap-12 px-6 py-24 sm:px-12 lg:px-20">
          <div className="flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1c2a3a] via-[#243247] to-[#3a2a1c]">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-white/40">
              photo
            </span>
          </div>
          <p className="max-w-3xl text-2xl font-medium leading-[1.35] tracking-tight sm:text-3xl">
            {me.bio}
          </p>
        </div>
        {me.projects.map((project, i) => (
          <div
            key={project.slug}
            className="relative flex min-h-screen items-center"
          >
            <div className="pointer-events-none absolute left-6 top-8 sm:left-12 lg:left-20">
              <CounterBadge index={i} />
            </div>
            <PanelContent project={project} />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section ref={root} id="showcase" className="relative">
      <div ref={pin} className="relative h-screen w-full overflow-hidden">
        {/* Preloader — covers everything, then slides up to reveal the hero. */}
        <div className="sc-preloader absolute inset-0 z-[200] flex items-center justify-center bg-background">
          <div className="sc-loading flex items-center gap-3">
            <span
              aria-hidden
              className="font-sans text-3xl font-thin leading-none text-foreground/70"
            >
              (
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.35em] text-muted">
              Loading
            </span>
            <span
              aria-hidden
              className="font-sans text-3xl font-thin leading-none text-foreground/70"
            >
              )
            </span>
          </div>
        </div>

        {/* Nav */}
        <header className="sc-nav sc-hero-fade absolute inset-x-0 top-0 z-[90] flex items-center justify-between px-6 py-6 sm:px-12 lg:px-20">
          <a
            href="#showcase"
            className="font-mono text-lg font-semibold tracking-tight"
            aria-label={`${me.name} — home`}
          >
            RS
          </a>
          <nav className="flex items-center gap-6 sm:gap-10">
            {NAV_LINKS.map((link, i) => (
              <NavLink
                key={link.label}
                label={link.label}
                href={link.href}
                delay={1900 + i * 99}
              />
            ))}
          </nav>
        </header>

        {/* Headline + the bracketed HELLO card. */}
        <div className="sc-headline sc-hero-fade pointer-events-none absolute inset-0 z-10 flex flex-col">
          <div className="mt-24 flex items-center justify-center gap-4 sm:mt-28">
            <span
              aria-hidden
              className="select-none font-sans text-[7rem] font-thin leading-none text-foreground/80"
            >
              (
            </span>
            <div className="max-w-xs text-center">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-foreground">
                Hello!
              </p>
              <p
                ref={scrambleRef}
                className="font-sans text-base leading-relaxed text-muted"
              >
                {helloText}
              </p>
            </div>
            <span
              aria-hidden
              className="select-none font-sans text-[7rem] font-thin leading-none text-foreground/80"
            >
              )
            </span>
          </div>

          <div className="mt-auto flex items-center justify-between gap-4 px-6 pb-14 sm:px-12 lg:px-20">
            <span className="block overflow-hidden">
              <span className="sc-word headline-echo block font-display text-[9.5vw] leading-[0.85] lowercase tracking-tight">
                structured
              </span>
            </span>
            <div className="sc-photo-slot h-[22vh] w-[14vw] shrink-0" aria-hidden />
            <span className="block overflow-hidden">
              <span className="sc-word headline-echo block font-display text-[9.5vw] leading-[0.85] lowercase tracking-tight">
                ambition
              </span>
            </span>
          </div>
        </div>

        {/* The photo — geometry driven from the slot out to the frame. */}
        <div className="sc-photo sc-hero-fade absolute z-20 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1c2a3a] via-[#243247] to-[#3a2a1c] will-change-[top,left,width,height]" />

        {/* Bio — streams in over the framed photo. */}
        <div className="sc-bio pointer-events-none absolute inset-3 z-30 flex items-center px-[8%]">
          <p className="max-w-3xl text-2xl font-medium leading-[1.35] tracking-tight sm:text-3xl lg:text-4xl">
            {bioWords.map((word, i) => (
              <span key={i} className="sc-bio-word">
                {word}{" "}
              </span>
            ))}
          </p>
        </div>

        {/* Counter — appears for the projects phase. */}
        <div className="sc-counter pointer-events-none absolute left-6 top-8 z-[100] sm:left-12 lg:left-20">
          <CounterBadge index={active} />
        </div>

        {/* Project cards — slide up and stack within the same frame. */}
        {me.projects.map((project, i) => (
          <div
            key={project.slug}
            className="project-card absolute inset-3 overflow-hidden rounded-[2rem] border border-white/10 bg-background will-change-transform"
            style={{ zIndex: 40 + i }}
          >
            <div className="sc-card-content h-full w-full">
              <PanelContent project={project} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
