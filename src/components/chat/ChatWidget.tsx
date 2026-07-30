"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { me } from "@/data/me";

/**
 * ChatWidget — a persistent pill at the bottom of the window ("Ask about
 * Aarya") that opens a docked drawer (right side on desktop, bottom sheet on
 * mobile) with a streaming, grounded chat.
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

  // Move focus into the drawer on open, restore it to the trigger on close.
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

  // While open: Esc closes, and Tab is trapped inside the drawer so keyboard
  // focus can't wander to the (inert) page behind it.
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
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
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
      {/* ── The pill ────────────────────────────────────────────────────────
          Fixed, bottom-centre. Hidden while the drawer is open. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the AI chat"
        className={`group fixed bottom-6 left-1/2 z-[190] flex -translate-x-1/2 items-center gap-3 rounded-full border border-black/15 bg-background/80 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-foreground shadow-[0_8px_30px_-8px_rgba(0,0,0,0.6)] backdrop-blur transition-[color,border-color,opacity,transform] duration-300 hover:border-accent/60 hover:text-accent ${
          open ? "pointer-events-none translate-y-24 opacity-0" : "opacity-100"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        Ask about {me.name.split(" ")[0]}
      </button>

      {/* ── Scrim (click to close) ─────────────────────────────────────────── */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[195] bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />

      {/* ── The drawer ─────────────────────────────────────────────────────── */}
      <aside
        ref={asideRef}
        role="dialog"
        aria-label={`Chat about ${me.name}`}
        aria-modal="true"
        inert={!open}
        className={`fixed z-[200] flex flex-col border-black/10 bg-background transition-transform duration-300 ease-out
          inset-x-0 bottom-0 h-[85vh] rounded-t-2xl border-t
          sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:w-[420px] sm:max-w-full sm:rounded-none sm:border-l sm:border-t-0
          ${open ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <div className="flex flex-col">
            <span className="font-display text-lg leading-none tracking-tight">
              Ask my portfolio
            </span>
            <span className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
              Grounded on {me.name.split(" ")[0]}&apos;s work
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/15 text-muted transition-colors hover:border-accent/60 hover:text-accent"
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
            <div className="flex flex-col gap-4">
              <p className="text-sm leading-relaxed text-muted">
                Ask me anything about {me.name.split(" ")[0]}&apos;s experience,
                projects, or skills.
              </p>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="rounded-lg border border-black/10 px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    {s}
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
                      : "border border-black/10 bg-black/[0.03] text-foreground"
                  }`}
                >
                  {text}
                </div>
              </div>
            );
          })}

          {status === "submitted" && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
                </span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm leading-relaxed text-red-400/80">
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
          className="flex items-center gap-2 border-t border-black/10 px-4 py-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label={`Ask about ${me.name.split(" ")[0]}`}
            placeholder={`Ask about ${me.name.split(" ")[0]}…`}
            className="flex-1 rounded-full border border-black/15 bg-transparent px-4 py-2.5 text-base text-foreground placeholder:text-muted focus:border-accent/60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-sm"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-muted transition-colors hover:border-accent/60 hover:text-accent"
              aria-label="Stop generating"
            >
              ■
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-on-accent transition-opacity disabled:opacity-40"
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
