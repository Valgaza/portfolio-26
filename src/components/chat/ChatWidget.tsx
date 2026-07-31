"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion } from "motion/react";
import { me } from "@/data/me";
import SiriOrb from "@/components/ui/SiriOrb";

/**
 * ChatWidget — a persistent pill ("Ask about Aarya") that opens a floating,
 * Intercom-style chat card (bottom-right on desktop, a bottom sheet on mobile)
 * with a streaming, grounded chat.
 *
 * The bot answers only from `me.ts` (see `@/lib/chat/knowledge`) via the
 * `/api/chat` route. Until ANTHROPIC_API_KEY is set the route returns a 503 and
 * we surface that as a friendly inline message.
 */

const SUGGESTIONS = [
  "What did Aarya do at PwC?",
  "Tell me about Indexial",
  "What's his strongest stack?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const first = me.name.split(" ")[0];

  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const busy = status === "submitted" || status === "streaming";

  // Keep the transcript scrolled to the latest message.
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, status]);

  // Move focus into the card on open, restore it to the trigger on close.
  useEffect(() => {
    if (open) {
      lastFocused.current = document.activeElement as HTMLElement | null;
      asideRef.current
        ?.querySelector<HTMLElement>(
          'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])',
        )
        ?.focus();
    } else {
      lastFocused.current?.focus?.();
    }
  }, [open]);

  // While open: Esc closes, and Tab is trapped inside the card so keyboard focus
  // can't wander to the (inert) page behind it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !asideRef.current) return;
      const items = asideRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <>
      {/* ── The morph-dock trigger — fixed, bottom-centre; a shimmering SiriOrb
          + label. Hidden while the card is open. ── */}
      <div
        className={`fixed bottom-6 left-1/2 z-[190] -translate-x-1/2 transition-[opacity,transform] duration-300 ${
          open ? "pointer-events-none translate-y-24 opacity-0" : "opacity-100"
        }`}
      >
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open the AI chat"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{
            type: "spring",
            stiffness: 550,
            damping: 45,
            mass: 0.7,
          }}
          className="group flex items-center gap-2.5 rounded-full border border-white/15 bg-surface/90 px-4 py-2 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.6)] backdrop-blur"
        >
          <SiriOrb size={24} />
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-foreground transition-colors group-hover:text-accent">
            Talk to me right now
          </span>
        </motion.button>
      </div>

      {/* ── Scrim (click to close) — light, so the card reads as a widget. ── */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[195] bg-black/30 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />

      {/* ── The floating card ── */}
      <aside
        ref={asideRef}
        role="dialog"
        aria-label={`Chat about ${me.name}`}
        aria-modal="true"
        inert={!open}
        className={`fixed z-[200] flex flex-col overflow-hidden border-white/10 bg-surface shadow-2xl transition-[transform,opacity] duration-300 ease-out
          inset-x-0 bottom-0 h-[85vh] rounded-t-2xl border-t
          sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:h-[600px] sm:max-h-[calc(100vh-3rem)] sm:w-[400px] sm:rounded-2xl sm:border
          ${
            open
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-full opacity-0 sm:translate-y-8"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-display text-base text-on-accent">
              {first[0]}
            </span>
            <div className="flex flex-col">
              <span className="font-display text-base leading-none tracking-tight">
                Ask my portfolio
              </span>
              <span className="mt-1.5 flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Grounded on {first}&apos;s work
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-muted transition-colors hover:border-accent/60 hover:text-accent"
          >
            ✕
          </button>
        </div>

        {/* Transcript. `data-lenis-prevent` lets this scroll independently of
            the page's Lenis smooth-scroll. */}
        <div
          ref={scrollRef}
          data-lenis-prevent
          className="flex-1 space-y-4 overflow-y-auto px-5 py-6"
        >
          {messages.length === 0 && (
            <div className="flex flex-col gap-6">
              {/* Greeting hero */}
              <div>
                <p className="font-display text-2xl leading-tight tracking-tight">
                  Hi there <span className="align-middle">👋</span>
                </p>
                <p className="mt-2 text-base leading-snug text-muted">
                  Ask me anything about {first}&apos;s experience, projects, or
                  skills.
                </p>
              </div>
              {/* Suggested questions, styled like help-article rows */}
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-accent/50 hover:bg-white/[0.06]"
                  >
                    <span>{s}</span>
                    <span
                      aria-hidden
                      className="text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
                    >
                      ›
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                      ? "bg-accent text-on-accent"
                      : "border border-white/10 bg-white/[0.04] text-foreground"
                  }`}
                >
                  {text}
                </div>
              </div>
            );
          })}

          {status === "submitted" && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
                </span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm leading-relaxed text-red-300">
              Can&apos;t reach the assistant right now. Please try again shortly.
            </p>
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex items-center gap-2 border-t border-white/10 px-4 py-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label={`Ask about ${first}`}
            placeholder={`Ask about ${first}…`}
            className="flex-1 rounded-full border border-white/15 bg-transparent px-4 py-2.5 text-base text-foreground placeholder:text-muted focus:border-accent/60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-sm"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-muted transition-colors hover:border-accent/60 hover:text-accent"
              aria-label="Stop generating"
            >
              ■
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent transition-opacity disabled:opacity-40"
              aria-label="Send message"
            >
              ↑
            </button>
          )}
        </form>
      </aside>
    </>
  );
}
