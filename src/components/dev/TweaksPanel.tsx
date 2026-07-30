"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * TweaksPanel — DEV-ONLY identity explorer.
 *
 * A floating corner panel that rewrites the site's design tokens live so we can
 * mix-and-match colour + type directions before committing one. It sets the
 * palette vars (--background / --foreground / --muted / --accent) and the three
 * font-role pointers (--role-display / --role-body / --role-mono) on <html>,
 * which everything else already reads from.
 *
 * ── REMOVE BEFORE LAUNCH ──
 *  1. delete this file
 *  2. delete the import + <TweaksPanel/> in src/app/layout.tsx
 *  3. optionally drop the alternate fonts in layout.tsx you didn't keep
 *
 * "Copy CSS" emits the current tokens ready to paste into globals.css :root, so
 * baking in the winner is a paste, not a rebuild.
 */

type Tokens = {
  background: string;
  foreground: string;
  muted: string;
  accent: string;
  display: string; // a `var(--font-*)` string
  body: string;
  mono: string;
};

// The families loaded in layout.tsx, as {label -> css var}. Add a font here
// only after you've also loaded it in layout.tsx.
const DISPLAY_FONTS = {
  Anton: "var(--font-anton)",
  "Space Grotesk": "var(--font-space-grotesk)",
  "Instrument Serif": "var(--font-instrument-serif)",
  Syne: "var(--font-syne)",
  Newsreader: "var(--font-newsreader)",
} as const;

const BODY_FONTS = {
  Geist: "var(--font-geist)",
  "IBM Plex Sans": "var(--font-ibm-plex-sans)",
  "Space Grotesk": "var(--font-space-grotesk)",
  Newsreader: "var(--font-newsreader)",
} as const;

const MONO_FONTS = {
  "Martian Mono": "var(--font-martian)",
  "JetBrains Mono": "var(--font-jetbrains-mono)",
  "Space Mono": "var(--font-space-mono)",
} as const;

// ── Identity directions ──────────────────────────────────────────────────────
// Each preset bundles a palette + a type pairing, plus a note on the MOTIF /
// feel we'd build into the section rhythm phase (the panel can't apply motif,
// only palette + type — the note keeps the concept attached).
type Preset = Tokens & { name: string; note: string };

const PRESETS: Preset[] = [
  {
    name: "Light Industrial",
    note: "COMMITTED direction — warm paper, charcoal ink, safety-orange signal accent. Motif: hairline grid, technical mono labels, a drawn signal trace.",
    background: "#f4f3ef",
    foreground: "#1a1a1a",
    muted: "#57544e",
    accent: "#ff5a1f",
    display: DISPLAY_FONTS["Anton"],
    body: BODY_FONTS["Geist"],
    mono: MONO_FONTS["Martian Mono"],
  },
  {
    name: "Instrument",
    note: "Telemetry / lab bench. Warm black, oscilloscope amber. Motif: reticles, tick marks, scan-lines, sensor read-outs.",
    background: "#0e0d0b",
    foreground: "#f2ede3",
    muted: "#8c8578",
    accent: "#ff9e3d",
    display: DISPLAY_FONTS["Space Grotesk"],
    body: BODY_FONTS["Geist"],
    mono: MONO_FONTS["JetBrains Mono"],
  },
  {
    name: "Latent",
    note: "AI-native. Deep blue-black, indigo→magenta. Accent used scarcely. Motif: node/edge graph, embedding scatter, one gradient mesh.",
    background: "#0b0b12",
    foreground: "#ecebfa",
    muted: "#7c7a94",
    accent: "#7c6cff",
    display: DISPLAY_FONTS["Space Grotesk"],
    body: BODY_FONTS["IBM Plex Sans"],
    mono: MONO_FONTS["Space Mono"],
  },
  {
    name: "Paper",
    note: "The big divergence — LIGHT, editorial, research-paper. Warm paper, ink text, vermilion accent. Motif: figure numbers, margin rules, footnotes.",
    background: "#f2efe7",
    foreground: "#17150f",
    muted: "#6b6659",
    accent: "#cc3b28",
    display: DISPLAY_FONTS["Instrument Serif"],
    body: BODY_FONTS["Newsreader"],
    mono: MONO_FONTS["JetBrains Mono"],
  },
  {
    name: "Brutal",
    note: "High-contrast, confident, un-trendy. Near-white canvas, black ink, one siren accent. Motif: exposed grid, oversized numerals, hard rules.",
    background: "#f4f4f2",
    foreground: "#0a0a0a",
    muted: "#707070",
    accent: "#ff3b00",
    display: DISPLAY_FONTS["Syne"],
    body: BODY_FONTS["Space Grotesk"],
    mono: MONO_FONTS["Space Mono"],
  },
];

const STORAGE_KEY = "portfolio-tweaks";
const DEFAULT = PRESETS[0];

function applyTokens(t: Tokens) {
  const r = document.documentElement.style;
  r.setProperty("--background", t.background);
  r.setProperty("--foreground", t.foreground);
  r.setProperty("--muted", t.muted);
  r.setProperty("--accent", t.accent);
  r.setProperty("--role-display", t.display);
  r.setProperty("--role-body", t.body);
  r.setProperty("--role-mono", t.mono);
}

// css var string -> readable label (for showing the active option in a <select>)
function labelFor(map: Record<string, string>, value: string) {
  return Object.entries(map).find(([, v]) => v === value)?.[0] ?? "";
}

export default function TweaksPanel() {
  const [open, setOpen] = useState(false);
  const [t, setT] = useState<Tokens>(DEFAULT);
  const [copied, setCopied] = useState(false);

  // Load any saved exploration on mount, then apply it.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = { ...DEFAULT, ...(JSON.parse(saved) as Partial<Tokens>) };
        // Intentional: hydrate the panel from saved exploration on mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setT(parsed);
        applyTokens(parsed);
      }
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const update = useCallback((patch: Partial<Tokens>) => {
    setT((prev) => {
      const next = { ...prev, ...patch };
      applyTokens(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const applyPreset = useCallback(
    (p: Preset) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { name, note, ...tokens } = p;
      update(tokens);
    },
    [update],
  );

  const reset = useCallback(() => {
    update(DEFAULT);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [update]);

  const activePresetName = useMemo(
    () =>
      PRESETS.find(
        (p) =>
          p.background === t.background &&
          p.accent === t.accent &&
          p.display === t.display &&
          p.body === t.body &&
          p.mono === t.mono,
      )?.name ?? null,
    [t],
  );

  const cssText = useMemo(
    () =>
      `:root {
  --background: ${t.background};
  --foreground: ${t.foreground};
  --muted: ${t.muted};
  --accent: ${t.accent};
  --role-display: ${t.display};
  --role-body: ${t.body};
  --role-mono: ${t.mono};
}`,
    [t],
  );

  const copyCss = useCallback(() => {
    navigator.clipboard?.writeText(cssText).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    });
  }, [cssText]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[300] flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/95 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-200 shadow-2xl backdrop-blur transition-colors hover:border-zinc-500 hover:text-white"
        style={{ fontFamily: "ui-monospace, monospace" }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: t.accent }}
        />
        Tweaks
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-[300] flex max-h-[88vh] w-[320px] flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900/95 text-zinc-200 shadow-2xl backdrop-blur"
      style={{ fontFamily: "ui-monospace, monospace" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            Identity Tweaks
          </span>
          <span className="text-[9px] uppercase tracking-[0.15em] text-zinc-500">
            dev only · remove before launch
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Collapse tweaks panel"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {/* Presets */}
        <section className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Directions
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESETS.map((p) => {
              const isActive = activePresetName === p.name;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[11px] transition-colors ${
                    isActive
                      ? "border-zinc-400 bg-zinc-800 text-white"
                      : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full border border-black/30"
                    style={{ background: p.accent }}
                  />
                  {p.name}
                </button>
              );
            })}
          </div>
          {activePresetName && (
            <p className="pt-1 text-[10px] leading-relaxed text-zinc-500">
              {PRESETS.find((p) => p.name === activePresetName)?.note}
            </p>
          )}
        </section>

        {/* Colours */}
        <section className="space-y-2.5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Palette
          </p>
          {(
            [
              ["background", "Background"],
              ["foreground", "Foreground"],
              ["muted", "Muted"],
              ["accent", "Accent"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <label className="text-[11px] text-zinc-300">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={t[key]}
                  onChange={(e) => update({ [key]: e.target.value })}
                  spellCheck={false}
                  className="w-[76px] rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-200 outline-none focus:border-zinc-500"
                />
                <input
                  type="color"
                  value={t[key]}
                  onChange={(e) => update({ [key]: e.target.value })}
                  className="h-7 w-7 cursor-pointer rounded border border-zinc-700 bg-transparent"
                  aria-label={`${label} colour`}
                />
              </div>
            </div>
          ))}
        </section>

        {/* Type */}
        <section className="space-y-2.5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Type
          </p>
          {(
            [
              ["display", "Display", DISPLAY_FONTS],
              ["body", "Body", BODY_FONTS],
              ["mono", "Mono", MONO_FONTS],
            ] as const
          ).map(([key, label, map]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <label className="text-[11px] text-zinc-300">{label}</label>
              <select
                value={labelFor(map, t[key])}
                onChange={(e) =>
                  update({ [key]: (map as Record<string, string>)[e.target.value] })
                }
                className="w-[150px] rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-200 outline-none focus:border-zinc-500"
              >
                {Object.keys(map).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </section>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 border-t border-zinc-800 px-4 py-3">
        <button
          type="button"
          onClick={copyCss}
          className="flex-1 rounded-lg border border-zinc-700 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
        >
          {copied ? "Copied ✓" : "Copy CSS"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
