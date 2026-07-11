"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { me } from "@/data/me";
import { MaskLine, useScrollReveal } from "@/lib/animation/reveal";

// Flatten the grouped skills into one list of tag strings for the physics pit.
const tags = me.skills.flatMap((g) => g.items);

/**
 * Skills as a physics playground (Matter.js).
 *
 * THE CORE PATTERN — "DOM elements synced to physics bodies":
 * Matter.js has no idea about HTML. So we run an *invisible* simulation: for
 * every skill chip we create a rigid rectangle body, plus static walls + a
 * floor sized to the container. Matter integrates the physics; then on every
 * animation frame we copy each body's position and angle onto its real DOM chip
 * via `transform`. The chip is just a puppet — Matter is the source of truth.
 * That's how we get crisp, accessible HTML text that still falls and collides.
 *
 * We only start the simulation when the section scrolls into view (via an
 * IntersectionObserver), so the tags "drop" on cue and we don't burn CPU
 * off-screen. `prefers-reduced-motion` skips physics entirely and shows a calm
 * static layout instead.
 */
export default function Skills() {
  const root = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const chipEls = useRef<(HTMLDivElement | null)[]>([]);
  const [reduced, setReduced] = useState(false);
  // Bumped on resize to force a clean physics re-init at the new dimensions.
  const [rev, setRev] = useState(0);

  // Reveal the heading with our shared scroll utility (chips are handled by
  // Matter, not by this — they're not .mask-line/.reveal-fade targets).
  useScrollReveal(root);

  // Detect reduced-motion preference once on mount.
  useEffect(() => {
    setReduced(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  // Debounced resize → re-init physics at the new container size.
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

  useEffect(() => {
    if (reduced) return; // static layout branch handles rendering
    const container = scene.current;
    if (!container) return;

    const { Engine, Bodies, Composite, Mouse, MouseConstraint } = Matter;

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;

    const engine = Engine.create();
    engine.gravity.y = 1;

    // Static boundaries: floor + two side walls (extra-tall so nothing escapes
    // sideways while falling). `thickness` keeps fast bodies from tunneling.
    const thickness = 200;
    const wallOpts = { isStatic: true };
    const walls = [
      Bodies.rectangle(width / 2, height + thickness / 2, width + thickness, thickness, wallOpts), // floor
      Bodies.rectangle(-thickness / 2, height / 2, thickness, height * 3, wallOpts), // left
      Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 3, wallOpts), // right
    ];
    Composite.add(engine.world, walls);

    // One body per chip. We measure the real DOM element so the body matches
    // the rendered chip exactly, then start it above the pit so it drops in.
    const chips = chipEls.current.filter(Boolean) as HTMLDivElement[];
    const pairs = chips.map((el) => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const x = Math.random() * (width - w) + w / 2;
      const y = -Math.random() * height - h; // staggered heights above the pit
      const body = Bodies.rectangle(x, y, w, h, {
        restitution: 0.35, // slight bounce
        friction: 0.35,
        frictionAir: 0.02,
        chamfer: { radius: Math.min(h / 2, 18) }, // rounded corners = pill feel
      });
      return { el, body, w, h };
    });
    Composite.add(engine.world, pairs.map((p) => p.body));

    // Drag support. Mouse.create maps pointer coords to the container's local
    // space — the same space our bodies live in — so no canvas is needed.
    const mouse = Mouse.create(container);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Composite.add(engine.world, mouseConstraint);

    // Matter's Mouse hijacks wheel events; remove them so the page (Lenis) can
    // still scroll when the cursor is over the pit.
    const m = mouse as unknown as {
      element: HTMLElement;
      mousewheel: EventListener;
    };
    m.element.removeEventListener("wheel", m.mousewheel);
    m.element.removeEventListener("DOMMouseScroll", m.mousewheel);

    // Render loop: advance the sim, then puppet the DOM. Body position is the
    // body's CENTER, so we offset by half the chip's size to get its top-left.
    let rafId = 0;
    let started = false;
    const frame = () => {
      Engine.update(engine, 1000 / 60);
      for (const { el, body, w, h } of pairs) {
        el.style.transform = `translate(${body.position.x - w / 2}px, ${
          body.position.y - h / 2
        }px) rotate(${body.angle}rad)`;
      }
      rafId = requestAnimationFrame(frame);
    };

    // Only run once the pit is on screen.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            for (const { el } of pairs) el.style.opacity = "1";
            frame();
          }
        }
      },
      { threshold: 0.2 },
    );
    io.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [reduced, rev]);

  return (
    <section
      ref={root}
      id="skills"
      className="flex min-h-screen flex-col gap-8 px-6 py-24 sm:px-12 lg:px-20"
    >
      <div className="flex flex-col gap-4">
        <p className="reveal-fade font-mono text-sm uppercase tracking-[0.25em] text-accent">
          Skills
        </p>
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          <MaskLine>Drag them around.</MaskLine>
        </h2>
      </div>

      {reduced ? (
        // Reduced-motion: no physics, just a calm wrapped list.
        <div className="flex flex-1 flex-wrap content-center items-center gap-3">
          {tags.map((tag) => (
            <span key={tag} className={CHIP_CLASS}>
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <div
          ref={scene}
          className="relative w-full flex-1 min-h-[55vh] cursor-grab overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] active:cursor-grabbing"
        >
          {tags.map((tag, i) => (
            <div
              key={tag}
              ref={(el) => {
                chipEls.current[i] = el;
              }}
              // Absolutely positioned puppets. Start at 0,0 + opacity 0 so we
              // never see them stacked before the sim places them.
              style={{ opacity: 0, willChange: "transform" }}
              className={`absolute left-0 top-0 select-none ${CHIP_CLASS}`}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const CHIP_CLASS =
  "whitespace-nowrap rounded-full border border-white/15 bg-background px-4 py-2 font-mono text-sm text-foreground";
