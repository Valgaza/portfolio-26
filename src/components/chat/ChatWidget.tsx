"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { me } from "@/data/me";
import SiriOrb from "@/components/ui/SiriOrb";

/**
 * ChatWidget — a persistent pill ("Ask about Aarya") that opens a floating,
 * Intercom-style chat card (bottom-right on desktop, a bottom sheet on mobile)
 * with a streaming, grounded chat.
 *
 * The bot is grounded on the static system prompt in `@/lib/chat/knowledge`
 * via the `/api/chat` route. Until OPENAI_API_KEY is set the route returns a
 * 503 and we surface that as a friendly inline message.
 */

const SUGGESTIONS = [
  "What did you do at PwC?",
  "Tell me about Indexial",
  "What's your strongest stack?",
];

// The FAB orb's rendered size (px). This — not SiriOrb.tsx's default — is the
// real knob: it drives both the orb and the pulse ring that wraps it, so they
// always match. Bump it to grow the whole FAB.
const ORB_SIZE = 48;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const first = me.name.split(" ")[0];
  const reduce = useReducedMotion();

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
      {/* ── The chat FAB — a bare, pulsating SiriOrb pinned to the blob corner;
          on hover a pill slides out to its LEFT. Springs away when the card
          opens (the card grows from this same corner). ── */}
      <motion.div
        className="fixed bottom-17 right-20 z-[190]"
        initial={false}
        animate={
          open ? { opacity: 0, scale: reduce ? 1 : 0.5 } : { opacity: 1, scale: 1 }
        }
        transition={
          reduce ? { duration: 0.15 } : { type: "spring", duration: 0.35, bounce: 0 }
        }
        style={{ pointerEvents: open ? "none" : "auto" }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open the chat — talk to my digital clone"
          className="group flex items-center transition-transform duration-200 active:scale-[0.96]"
        >
          {/* Label pill — LEFT of the orb, expands on hover/focus (grid 0fr→1fr).
              It keeps its own surface pill for legibility now that the orb is bare. */}
          <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-out group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]">
            <span className="overflow-hidden">
              <span className="mr-3 block whitespace-nowrap rounded-full border border-foreground/15 bg-surface px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-foreground transition-colors group-hover:text-accent">
                Talk to my digital clone
              </span>
            </span>
          </span>
          {/* Bare SiriOrb + pulse — no surrounding surface ring. Size + the
              pulse ring both come from ORB_SIZE so they stay in lockstep. The
              ping is slowed from Tailwind's default 1s to a calmer 2.6s. */}
          <span
            className="relative flex shrink-0 items-center justify-center"
            style={{ width: ORB_SIZE, height: ORB_SIZE }}
          >
            <span className="absolute inset-0 rounded-full bg-accent/25 [animation-duration:2.6s] motion-safe:animate-ping" />
            <SiriOrb size={ORB_SIZE} />
          </span>
        </button>
      </motion.div>

      {/* ── Scrim (click to close) — light, so the card reads as a widget. ── */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[195] bg-black/30 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />

      {/* ── The floating card — grows out of the blob's bottom-right corner
          (matching sm:bottom/right + transform-origin) with a spring. ── */}
      <motion.aside
        ref={asideRef}
        role="dialog"
        aria-label={`Chat about ${me.name}`}
        aria-modal="true"
        inert={!open}
        initial={false}
        animate={
          open
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 0, scale: reduce ? 1 : 0.92, y: reduce ? 0 : 12 }
        }
        transition={
          reduce ? { duration: 0.15 } : { type: "spring", duration: 0.45, bounce: 0 }
        }
        style={{ transformOrigin: "bottom right" }}
        className={`fixed z-[200] flex flex-col overflow-hidden border-foreground/10 bg-surface shadow-2xl
          inset-x-0 bottom-0 h-[85vh] rounded-t-2xl border-t
          sm:inset-x-auto sm:bottom-17 sm:right-20 sm:top-auto sm:h-[680px] sm:max-h-[calc(100vh-3rem)] sm:w-[440px] sm:rounded-2xl sm:border
          ${open ? "" : "pointer-events-none"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-foreground/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-display text-base text-on-accent">
              {first[0]}
            </span>
            <div className="flex flex-col">
              <span className="font-display text-base leading-none tracking-tight">
                {first}&apos;s digital clone
              </span>
              <span className="mt-1.5 flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Always available
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-foreground/15 text-muted transition-colors hover:border-accent/60 hover:text-accent"
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
                  Hi, I&apos;m {first} <span className="align-middle">👋</span>
                </p>
                <p className="mt-2 text-base leading-snug text-muted">
                  Ask me anything about my experience, projects, or skills.
                </p>
              </div>
              {/* Suggested questions, styled like help-article rows */}
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-accent/50 hover:bg-foreground/[0.06]"
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
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduce
                    ? { duration: 0.15 }
                    : { type: "spring", duration: 0.4, bounce: 0 }
                }
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                      ? "bg-accent text-on-accent"
                      : "border border-foreground/10 bg-foreground/[0.04] text-foreground"
                  }`}
                >
                  {text}
                </div>
              </motion.div>
            );
          })}

          {status === "submitted" && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.04] px-4 py-3">
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
          className="flex items-center gap-2 border-t border-foreground/10 px-4 py-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Ask me anything"
            placeholder="Ask me anything…"
            className="flex-1 rounded-full border border-foreground/15 bg-transparent px-4 py-2.5 text-base text-foreground placeholder:text-muted focus:border-accent/60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-sm"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-foreground/15 text-muted transition-colors hover:border-accent/60 hover:text-accent"
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
      </motion.aside>
    </>
  );
}
