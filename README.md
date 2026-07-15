# Rehearse

**Practice the conversations and decisions that scare you, with an AI that pushes back.**

Rehearse is a small Next.js 14 app for getting reps on the hard stuff before it counts. It has two modes. **Conversation Simulator** lets you pick a tough scenario — asking for a raise, giving hard feedback, breaking up a partnership — and an AI role-plays the other person realistically while you practice; when you're done you get a graded, screenshot-worthy **Report** on what worked, what hurt you (with better lines to try instead), and the one thing to change next time. **Pre-Mortem** takes a big decision you're weighing and runs an imagined "fast-forward two years, this failed spectacularly, why?" interview one dimension at a time, then hands you a **risk map** — the story of the failure, ranked risks, and concrete inoculations for each.

**It gets to know your real people.** In the Conversation Simulator you can save someone from your actual life — your manager, your mom, your co-founder — and attach them to a scenario. The AI then role-plays *that person* using what you've told it, and after each session it distills what it learned and folds it back into their profile. The more you rehearse someone, the more the simulation feels like them. (Everything is stored locally in your browser.)

**Open-source models, and made to share.** Rehearse runs on open models via **Groq** by default — swappable to any OpenAI-compatible provider with one env change. Replies **stream in live**, you can **describe your own scenario** in a sentence and drop straight into it, and every report **exports as a shareable image**.

---

## Quickstart

```bash
npm install
cp .env.example .env.local        # then open .env.local and paste your key
npm run dev
```

Open **http://localhost:3000**.

Rehearse runs on open-source models through an OpenAI-compatible provider — **Groq** by default. Grab a free key at <https://console.groq.com/keys> and put it in `.env.local`:

```
GROQ_API_KEY=gsk_...
```

To point at a different provider or models, set `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL_FAST` / `LLM_MODEL_STRONG` (examples in `.env.example` — OpenRouter, Together, Ollama). The API routes throw a clear error (mentioning `.env.local`) if no key is set.

**Scripts**

| Command | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Next.js lint |
| `npm run typecheck` | `tsc --noEmit` (strict mode) |

---

## Deploy (Vercel)

Rehearse is a stock Next.js app, so Vercel auto-detects the framework — no `vercel.json` needed.

1. Push to GitHub (done).
2. In Vercel: **Add New → Project**, import the `rehearse` repo.
3. Add an environment variable **`GROQ_API_KEY`** = your key, for **Production** (and Preview if you want deploy previews to work). (Or the `LLM_*` vars for another provider.)
4. **Deploy.** You get a live URL in about a minute.

**Notes**

- Each LLM API route runs as a Node serverless function with `export const maxDuration = 60`, so the analysis/report/memory/scenario calls don't hit Vercel's default 10s timeout. The share-image route (`/api/og`) runs on the Edge runtime.
- **Cost & access:** the free daily cap lives in the browser, so it does **not** protect the server endpoints — anyone who has the URL can hit `/api/*` and spend your provider (Groq) credits. Keep the URL private for personal use; before sharing it widely, enable Vercel **Deployment Protection** or add real auth + server-side rate-limiting (see the roadmap).

---

## Models & routing

Rehearse talks to any **OpenAI-compatible** provider through one small client (`lib/llm.ts`) — no vendor SDK, just `fetch`. The default is **Groq** running open models, and it routes each call to the cheapest model that's good enough for the job. Two env vars pick the models; everything else is derived.

| Job | Model (env) | Why | Frequency |
|---|---|---|---|
| Role-play turns (`roleplay`) | **`LLM_MODEL_FAST`** — `llama-3.1-8b-instant` | Fast + cheap; stays in character turn-to-turn. **Streamed.** | Many per session |
| Pre-mortem interview turns (`premortem`) | **`LLM_MODEL_FAST`** | One question at a time; low latency matters. **Streamed.** | Many per session |
| Post-game Report (`analysis`) | **`LLM_MODEL_STRONG`** — `llama-3.3-70b-versatile` | Grading a transcript into honest, quotable, strict-JSON feedback wants the stronger model (JSON mode) | Once per session |
| Risk map (`premortemReport`) | **`LLM_MODEL_STRONG`** | Synthesizing the interview into a ranked risk map is the payoff | Once per session |
| Memory extraction (`/api/remember`) | **`LLM_MODEL_STRONG`** | Distilling durable notes about a real person from a transcript | Once per session, optional |
| Build custom scenario (`/api/scenario`) | **`LLM_MODEL_STRONG`** | Expanding a one-line situation into a full playable scenario (JSON mode) | On demand |

**The rationale in one line:** the many chat/interview turns run on the fast small model and stream token-by-token; the one high-value structured synthesis per session runs on the strong model with JSON mode. Swap providers by setting `LLM_BASE_URL` + `LLM_API_KEY` (e.g. OpenRouter, Together) — the app never needs to know which provider is behind it.

**Free daily cap.** On top of routing, `lib/usage.ts` enforces a per-day session limit (`FREE_DAILY_LIMIT`, default **3**), tracked client-side in `localStorage` and reset each calendar day. It's a friendly guardrail against runaway LLM spend for an MVP and doubles as the natural boundary for a future paywall. When you're out, the UI shows a calm over-limit message with a usage badge instead of letting you start another session.

---

## Project structure

```
rehearse/
├── app/
│   ├── api/
│   │   ├── roleplay/route.ts      # POST { scenario, messages, person? } -> streamed text
│   │   ├── analyze/route.ts       # POST { scenario, messages, person? } -> { report }
│   │   ├── premortem/route.ts     # POST { messages, action } -> streamed text | { report }
│   │   ├── remember/route.ts      # POST { person, messages } -> { notes }
│   │   ├── scenario/route.ts      # POST { situation, persona?, goal? } -> { scenario }
│   │   └── og/route.tsx           # GET  share image (next/og, Edge runtime)
│   ├── error.tsx                  # route error boundary (recoverable fallback)
│   ├── globals.css
│   ├── layout.tsx                 # <html>/<body> shell, metadata
│   └── page.tsx                   # "use client" — state machine (home/chat/report/people)
├── components/
│   ├── ModeTabs.tsx               # Conversation | Pre-Mortem toggle
│   ├── ScenarioPicker.tsx         # scenario cards
│   ├── PersonSelect.tsx           # attach a saved real person to a conversation
│   ├── PeopleManager.tsx          # add / edit / delete your people + read their memory
│   ├── MessageBubble.tsx
│   ├── ChatWindow.tsx             # scrollable, auto-scroll, streaming typing indicator
│   ├── Composer.tsx               # textarea, Enter sends / Shift+Enter newline
│   ├── ReportCard.tsx             # graded conversation report
│   ├── PremortemReportCard.tsx    # risk map
│   └── UsageBadge.tsx             # used / limit
├── lib/
│   ├── types.ts                   # shared TS types (Scenario, Report, Session, Person, …)
│   ├── llm.ts                     # provider-agnostic client: complete / completeJson / streamText
│   ├── prompts.ts                 # system prompts + transcript rendering
│   ├── scenarios.ts               # built-in scenario catalog
│   ├── store.ts                   # localStorage session persistence
│   ├── people.ts                  # localStorage people + memory (appendNotes)
│   └── usage.ts                   # free daily cap
├── .env.example                   # GROQ_API_KEY / LLM_* template
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts             # Tailwind v3, darkMode: media
└── tsconfig.json                  # strict, "@/*" -> project root
```

**Conventions:** Next.js 14 App Router, React 18, TypeScript strict, Tailwind v3 only (no UI/icon/animation/state libraries — emoji + utility classes). **No runtime dependencies beyond Next/React** — the LLM client is plain `fetch` against an OpenAI-compatible endpoint. LLM routes run on the Node runtime (`maxDuration = 60`); the share-image route runs on Edge. Chat turns stream; structured outputs use JSON mode. Dark mode via Tailwind `dark:` variants; mobile-first throughout.

---

## Roadmap

- **Accounts + sync.** Memory of your real people already works locally — attach a person and the app learns them over time (see above). Next is signing in so those people and your session history sync across devices instead of living in a single browser.
- **Paywall on the analysis.** Keep unlimited-ish role-play cheap; put the high-value graded Report and risk map behind a paid tier (the free daily cap is already the seam for this).
- **Voice.** Speak your side and hear the other person talk back — the closest thing to the real, nervous-making moment.

*Shipped: real-people memory, custom scenarios, streaming replies, shareable report images, open-source models via Groq.*

---

## Metrics that matter

Two numbers tell us whether Rehearse actually helps:

- **Completion rate** — of sessions started, how many reach a finished Report or risk map. A started-but-abandoned session means the practice never paid off; this is the core "did it deliver value once" signal.
- **7-day return rate** — of people who finish a session, how many come back within a week. Hard conversations recur, and real behavior change comes from reps — so return rate is the truest read on whether this is a habit, not a one-time novelty.
