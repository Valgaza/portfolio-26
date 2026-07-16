import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { SYSTEM_PROMPT } from "@/lib/chat/knowledge";

// Allow streamed responses up to 30s.
export const maxDuration = 30;

// The model. Haiku is cheap + fast, which is what a public, grounded portfolio
// bot wants. Needs ANTHROPIC_API_KEY in the environment.
const MODEL = "claude-haiku-4-5-20251001";

// Rate limiting is OPTIONAL: it only turns on when Upstash env vars are present
// (so local dev works without them). On Vercel, set UPSTASH_REDIS_REST_URL and
// UPSTASH_REDIS_REST_TOKEN to protect the endpoint from abuse/cost.
const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(20, "1 h"),
        prefix: "portfolio-chat",
      })
    : null;

export async function POST(req: Request) {
  // Fail clearly if the key isn't set, rather than a cryptic provider error.
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      "The chat isn't configured yet (missing ANTHROPIC_API_KEY).",
      { status: 503 },
    );
  }

  if (ratelimit) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return new Response(
        "You've hit the message limit for now — please try again later.",
        { status: 429 },
      );
    }
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: anthropic(MODEL),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    // Keep answers short and costs bounded.
    maxOutputTokens: 600,
    temperature: 0.4,
  });

  return result.toUIMessageStreamResponse();
}
