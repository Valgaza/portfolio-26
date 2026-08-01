# Portfolio

Aarya Patil's personal portfolio — a single-page Next.js site with a pinned
experience timeline, a folder-driven project gallery, and an AI chat that
answers as a grounded "digital clone."

**Stack:** Next.js (App Router, Turbopack) · React · TypeScript · Tailwind v4 ·
GSAP + Lenis (scroll/animation) · Motion · Vercel AI SDK + OpenAI.

## Local setup

```bash
npm install
```

Then three one-time steps (each pulls in something kept out of the repo):

### 1. Environment

```bash
cp .env.example .env.local
```

Fill in `OPENAI_API_KEY` (from https://platform.openai.com/api-keys). Optional:
`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` enable per-IP rate
limiting on the chat endpoint. Without the OpenAI key the chat returns a 503 and
the drawer shows a friendly "not configured yet" message.

### 2. Font

The display typeface is **Kovanov**, licensed **Free for Personal Use** and
therefore **not redistributed in this repo**. Download it and place both files
in `content/`:

- `content/Kovanov-Regular.otf`
- `content/Kovanov Bold.ttf`

Source: https://exfont.com/kovanov-regular-2.font (see `content/exFont-License.txt`).

### 3. AI system prompt

The chat is grounded on a static system prompt kept out of the repo (it's
personal). Create your own from the template:

```bash
cp src/lib/chat/knowledge.example.ts src/lib/chat/knowledge.ts
```

Then edit `knowledge.ts` with your real content.

### Run

```bash
npm run dev
```

## Editing content

- **Projects** — one JSON file per project in `content/projects/` (sorted by
  filename). Images go in `public/projects/` and are referenced as
  `"image": "/projects/<slug>.png"`. No code changes needed to add a project.
- **Skills / experience / socials / email** — `src/data/me.ts`.
- **Chat knowledge / persona** — `src/lib/chat/knowledge.ts` (gitignored).

## Deploying

Because the font and `knowledge.ts` are gitignored, a **Git-connected Vercel
build would fail** (those files aren't in the repo). Deploy with the **Vercel
CLI** from a local checkout instead:

```bash
vercel        # preview
vercel --prod # production
```

`.vercelignore` makes the CLI upload the local font + prompt while excluding
secrets. Set `OPENAI_API_KEY` (and any Upstash vars) in the Vercel project's
environment settings — `.env.local` is never uploaded.
