"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
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
const UNIT_CARD = 1.45; // higher = each card takes more scroll (slower)
const SCROLL_PER_UNIT = 0.7;

const FRAME_MARGIN = 12; // px — matches `inset-3` on the cards
const PREV_CARD_SCALE = 0.92; // how much a covered card recedes

// Intro (load) palette — GSAP can't tween CSS vars, so use the raw hexes.
const YELLOW = "#e9e400";
const WHITE = "#f4f4ef";

/** A nav link whose text scrambles/decodes in, on a per-link delay. On hover a
 *  pair of brackets fades in around it. The scramble target is an inner <span>
 *  (its textContent gets rewritten each frame) so the bracket spans survive. */
function NavLink({
  label,
  href,
  delay,
}: {
  label: string;
  href: string;
  delay: number;
}) {
  const ref = useScramble<HTMLSpanElement>(label, { delay, duration: 700 });
  return (
    <a
      href={href}
      className="group relative inline-flex items-center font-mono text-[0.78rem] uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -left-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      >
        (
      </span>
      <span ref={ref}>{label}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute -right-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      >
        )
      </span>
    </a>
  );
}

/** The "||||" menu toggle — four vertical bars parked top-right, revealed once
 *  the photo fills the frame; hovering expands the nav links beneath it. */
function MenuToggle() {
  return (
    <div className="group flex flex-col items-end">
      <button
        type="button"
        aria-label="Open menu"
        className="flex items-center gap-[4px] p-2"
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-5 w-[2px] bg-foreground transition-all duration-300 group-hover:h-6"
          />
        ))}
      </button>
      <ul className="pointer-events-none flex -translate-y-1 flex-col items-end gap-2 pr-2 pt-3 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * "Visit Site" link. On hover the brackets spread apart and the arrow flies out
 * the top-right corner while a fresh one slides up from the bottom-left — a
 * masked double-arrow, so it reads as the arrow "launching" and being replaced.
 */
function VisitLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-foreground"
    >
      <span
        aria-hidden
        className="inline-block text-muted transition-transform duration-300 ease-out group-hover:-translate-x-2"
      >
        (
      </span>
      <span className="relative -top-[2px] px-1">Visit Site</span>
      <span
        aria-hidden
        className="relative inline-flex h-[1em] w-[1em] items-center justify-center overflow-hidden"
      >
        <span className="absolute transition-transform duration-300 ease-out group-hover:-translate-y-[1.1em] group-hover:translate-x-[1.1em]">
          ↗
        </span>
        <span className="absolute -translate-x-[1.1em] translate-y-[1.1em] transition-transform duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0">
          ↗
        </span>
      </span>
      <span
        aria-hidden
        className="inline-block text-muted transition-transform duration-300 ease-out group-hover:translate-x-2"
      >
        )
      </span>
    </a>
  );
}

/**
 * A project card body, arranged like the original: title + description + visit
 * link anchored bottom-left, the category/tech meta top-right, and the preview
 * mockup bottom-right. Every revealable piece carries `.sc-reveal` so the scroll
 * timeline can fade them up in a stagger (in the reduced layout they're static).
 */
function PanelContent({ project }: { project: Project }) {
  return (
    <div className="flex h-full w-full flex-col gap-10 px-8 py-12 sm:px-14 sm:py-16 lg:grid lg:grid-cols-2 lg:gap-12 lg:px-20">
      {/* LEFT column — title / description / visit, as one independent block.
          `pb-[TEXT_BLOCK_LIFT]` is the single knob for how high the block sits
          off the bottom; changing it does NOT move the preview (separate col). */}
      <div className="order-2 flex flex-col justify-end gap-6 lg:order-1 lg:pb-[16vh]">
        <h3 className="sc-reveal font-display text-5xl uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl">
          {project.title}
        </h3>
        <p className="sc-reveal max-w-md text-sm leading-relaxed text-muted sm:text-base">
          {project.description}
        </p>
        <div className="sc-reveal">
          {project.status === "in-progress" ? (
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted">
              <span aria-hidden>(</span>
              <span className="px-1">In Progress</span>
              <span aria-hidden>)</span>
            </span>
          ) : (
            <VisitLink href={project.links[0]?.href ?? "#"} />
          )}
        </div>
      </div>

      {/* RIGHT column — meta pinned to the top, preview pinned to the bottom.
          Independent of the left column, so the picture stays put. */}
      <div className="order-1 flex flex-col justify-between gap-8 lg:order-2">
        <div className="sc-reveal">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground sm:text-sm">
            {project.category}
          </p>
          <div className="my-4 h-px w-full bg-white/15" />
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-muted">
            {project.tech.join("   •   ")}
          </p>
        </div>
        <div className="sc-reveal relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.01]">
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

/**
 * The project counter — a circle with a progress ring around its circumference.
 * The ring is normalised with `pathLength={100}`, so the whole circle is 100
 * units and a quarter is 25. In the animated Showcase we DON'T set
 * `strokeDashoffset` in JSX (so React never clobbers it) — GSAP owns it and
 * scrubs it 100 → 0 across the four cards. In the reduced-motion fallback there
 * is no GSAP, so a `progress` prop paints each badge's fill statically.
 */
function CounterBadge({
  index,
  progress,
}: {
  index: number;
  progress?: number;
}) {
  return (
    <div className="relative flex h-34 w-34 items-center justify-center rounded-full bg-background/40 backdrop-blur-sm">
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
        />
        <circle
          className="sc-ring-progress"
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          {...(progress !== undefined
            ? { strokeDashoffset: 100 - progress }
            : {})}
        />
      </svg>
      <div className="flex flex-col items-center justify-center">
        <span className="font-mono text-[0.8rem] uppercase tracking-[0.2em] text-muted">
          Project
        </span>
        <span className="font-mono text-sm tracking-widest">
          <span className="text-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-muted"> | {total}</span>
        </span>
      </div>
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
    delay: 2300,
    duration: 1100,
  });
  // The preloader word decodes with the same scramble effect as everything else.
  const loadingRef = useScramble<HTMLSpanElement>("Loading", {
    delay: 200,
    duration: 1000,
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
      gsap.registerPlugin(Flip);
      window.scrollTo(0, 0);

      const scope = root.current!;
      const lBr = scope.querySelector<HTMLElement>(".sc-bracket-l")!;
      const rBr = scope.querySelector<HTMLElement>(".sc-bracket-r")!;
      const lSlot = scope.querySelector<HTMLElement>(".sc-load-slot-l")!;
      const rSlot = scope.querySelector<HTMLElement>(".sc-load-slot-r")!;

      // Pre-states: everything but the brackets + "Loading" is hidden; the
      // wordmark waits below its clip in yellow.
      gsap.set(".sc-hero-fade", { autoAlpha: 0 });
      gsap.set(".sc-word", { yPercent: 120, color: YELLOW });

      // Shrink the big hero brackets down onto the small preloader slots, record
      // that state, then release them back to natural. Flip.from then animates
      // the SAME brackets from the recorded (small, centered) box out to their
      // hero position — so the "( Loading )" brackets *are* the hero brackets.
      Flip.fit(lBr, lSlot, { scale: true });
      Flip.fit(rBr, rSlot, { scale: true });
      const bracketState = Flip.getState([lBr, rBr]);
      gsap.set([lBr, rBr], { clearProps: "transform" });

      const tl = gsap.timeline();
      // Brackets hold small (Flip.from renders the "from" state immediately)
      // while "Loading" scrambles, then expand outward into the hero brackets.
      tl.add(
        Flip.from(bracketState, { duration: 1.15, ease: "power3.inOut" }),
        1.5,
      );
      // "Loading" clears as the brackets pull apart.
      tl.to(
        ".sc-loading",
        { autoAlpha: 0, duration: 0.4, ease: "power1.out" },
        1.5,
      );
      // The hero content fades in between the arriving brackets.
      tl.to(
        ".sc-hero-fade",
        { autoAlpha: 1, duration: 0.6, ease: "power2.out" },
        2.05,
      );
      // Wordmark springs up (overshoot ≈ the measured spring bezier).
      tl.to(
        ".sc-word",
        { yPercent: 0, duration: 1.0, ease: "back.out(1.6)", stagger: 0.12 },
        2.2,
      );
      // Yellow → white settle (measured ease-in-out).
      tl.to(
        ".sc-word",
        { color: WHITE, duration: 0.9, ease: "power2.inOut", stagger: 0.1 },
        3.2,
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
      gsap.set(".sc-ring-progress", { strokeDashoffset: 100 });
      gsap.set(".sc-menu", { autoAlpha: 0 });
      gsap.set(cards, { yPercent: 100 });
      // Each card's inner pieces start hidden + nudged down; they fade up in a
      // stagger as the card settles (see the forEach below).
      gsap.set(".sc-reveal", { autoAlpha: 0, y: 26 });

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
            // Flip to the next number only once the incoming card is >40% in
            // (hence the -0.4 offset on its arrival fraction).
            const idx = Math.max(
              0,
              Math.min(n - 1, Math.floor((t - projectsStart) / UNIT_CARD - 0.4)),
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
      // As the top nav clears out, the "||||" menu icon settles in top-right.
      tl.to(".sc-menu", { autoAlpha: 1, duration: 0.25 }, UNIT_PHOTO * 0.8);

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
      // The ring fills smoothly across the whole projects phase — since each
      // card spans one UNIT_CARD, every card advances it exactly one quarter.
      tl.to(
        ".sc-ring-progress",
        { strokeDashoffset: 0, duration: n * UNIT_CARD },
        projectsStart,
      );
      cards.forEach((card, i) => {
        const at = projectsStart + i * UNIT_CARD;
        const items = gsap.utils.toArray<HTMLElement>(".sc-reveal", card);
        tl.to(card, { yPercent: 0, duration: UNIT_CARD }, at);
        // Staggered fade-up of the card's text/preview as it slides into place.
        tl.to(
          items,
          {
            autoAlpha: 1,
            y: 0,
            duration: UNIT_CARD * 0.4,
            ease: "power2.out",
            stagger: (UNIT_CARD * 0.45) / items.length,
          },
          at + UNIT_CARD * 0.25,
        );
        if (i > 0) {
          const prev = cards[i - 1];
          tl.to(
            gsap.utils.toArray<HTMLElement>(".sc-reveal", prev),
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
              <CounterBadge
                index={i}
                progress={((i + 1) / me.projects.length) * 100}
              />
            </div>
            <PanelContent project={project} />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section ref={root} id="showcase" className="relative">
      <div
        ref={pin}
        className="relative h-screen w-full overflow-hidden bg-background"
      >
        {/* Preloader — "( Loading )" centered. The brackets are invisible slots;
            the real hero brackets get Flip-fitted onto them, so what you see as
            the loading brackets literally expands into the hero brackets. */}
        <div className="sc-preloader pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
          <div className="sc-loading flex items-center justify-center gap-3">
            <span
              aria-hidden
              className="sc-load-slot-l select-none font-sans text-xl font-thin leading-none opacity-0"
            >
              (
            </span>
            <span
              ref={loadingRef}
              className="font-mono text-xs uppercase tracking-[0.35em] text-muted"
            >
              Loading
            </span>
            <span
              aria-hidden
              className="sc-load-slot-r select-none font-sans text-xl font-thin leading-none opacity-0"
            >
              )
            </span>
          </div>
        </div>

        {/* Nav */}
        <header className="sc-nav sc-hero-fade absolute inset-x-0 top-0 z-[90] flex items-center justify-between px-6 py-9 sm:px-12 lg:px-20">
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
                delay={2200 + i * 99}
              />
            ))}
          </nav>
        </header>

        {/* "||||" menu — hidden during the hero, fades in once the photo fills
            (the top nav has scrolled away by then); hover expands the links. */}
        <div className="sc-menu absolute right-6 top-11 z-[110] opacity-0 sm:right-12 lg:right-16">
          <MenuToggle />
        </div>

        {/* Headline + the bracketed HELLO card. The block itself is NOT faded —
            the brackets inside it must stay visible through the preloader — only
            the inner Hello text carries `sc-hero-fade`. */}
        <div className="sc-headline pointer-events-none absolute inset-0 z-10 flex flex-col">
          <div className="mt-28 flex items-center justify-center gap-7 sm:mt-32 sm:gap-9">
            <span
              aria-hidden
              className="sc-bracket sc-bracket-l select-none font-sans text-[9.5rem] font-thin leading-none text-foreground/80"
            >
              (
            </span>
            <div className="sc-hero-fade max-w-sm text-center">
              <p className="mb-4 font-mono text-sm uppercase tracking-[0.3em] text-foreground">
                Hello!
              </p>
              <p
                ref={scrambleRef}
                className="font-sans text-xl leading-relaxed text-muted"
              >
                {helloText}
              </p>
            </div>
            <span
              aria-hidden
              className="sc-bracket sc-bracket-r select-none font-sans text-[9.5rem] font-thin leading-none text-foreground/80"
            >
              )
            </span>
          </div>

          <div className="mt-auto flex items-center justify-between gap-4 px-6 pb-14 sm:px-12 lg:px-20">
            <span className="block overflow-hidden">
              <span className="sc-word headline-echo pointer-events-auto block cursor-default font-display text-[9.5vw] leading-[0.85] lowercase tracking-tight">
                structured
              </span>
            </span>
            {/* Little photo before it scrolls open — TWEAK its start size here
                (this slot's measured box is the photo's opening geometry). */}
            <div className="sc-photo-slot h-[27vh] w-[17vw] shrink-0" aria-hidden />
            <span className="block overflow-hidden">
              <span className="sc-word headline-echo pointer-events-auto block cursor-default font-display text-[9.5vw] leading-[0.85] lowercase tracking-tight">
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
        <div className="sc-counter pointer-events-none absolute left-8 top-18 z-[100] sm:left-12 lg:left-20">
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
