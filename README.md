# Rehearse

**Practice the conversations and decisions that scare you, with an AI that pushes back.**

Rehearse is a small Next.js 14 app for getting reps on the hard stuff before it counts. It has two modes. **Conversation Simulator** lets you pick a tough scenario — asking for a raise, giving hard feedback, breaking up a partnership — and an AI role-plays the other person realistically while you practice; when you're done you get a graded, screenshot-worthy **Report** on what worked, what hurt you (with better lines to try instead), and the one thing to change next time. **Pre-Mortem** takes a big decision you're weighing and runs an imagined "fast-forward two years, this failed spectacularly, why?" interview one dimension at a time, then hands you a **risk map** — the story of the failure, ranked risks, and concrete inoculations for each.

**It gets to know your real people.** In the Conversation Simulator you can save someone from your actual life — your manager, your mom, your co-founder — and attach them to a scenario. The AI then role-plays *that person* using what you've told it, and after each session it distills what it learned and folds it back into their profile. The more you rehearse someone, the more the simulation feels like them. (Everything is stored locally in your browser.)

---

## Quickstart

```bash
npm install
cp .env.example .env.local        # then open .env.local and paste your key
npm run dev
```

Open **http://localhost:3000**.

You need an Anthropic API key. Get one at <https://console.anthropic.com/settings/keys> and set it in `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

The API routes throw a clear error (mentioning `.env.local`) if the key is missing, so if role-play or analysis fails, check that first.

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
3. Add an environment variable **`ANTHROPIC_API_KEY`** = your key, for **Production** (and Preview if you want deploy previews to work).
4. **Deploy.** You get a live URL in about a minute.

**Notes**

- Each API route runs as a Node serverless function with `export const maxDuration = 60`, so the Sonnet analysis/report/memory calls don't hit Vercel's default 10s timeout.
- **Cost & access:** the free daily cap lives in the browser, so it does **not** protect the server endpoints — anyone who has the URL can hit `/api/*` and spend your Anthropic credits. Keep the URL private for personal use; before sharing it widely, enable Vercel **Deployment Protection** or add real auth + server-side rate-limiting (see the roadmap).

---

## Model routing & cost

Rehearse routes each call to the cheapest model that's good enough for the job. The routing lives in `lib/claude.ts` (`MODELS`), so it's one place to tune.

| Job | Model | Why | Frequency |
|---|---|---|---|
| Role-play turns (`roleplay`) | **Haiku 4.5** (`claude-haiku-4-5`) | Fast, cheap, plenty good for staying in character turn-to-turn | Many per session |
| Pre-mortem interview turns (`premortem`) | **Haiku 4.5** | Same — one question at a time, low latency matters | Many per session |
| Post-game Report (`analysis`) | **Sonnet 5** (`claude-sonnet-5`) | Grading a whole transcript into structured, honest, quotable feedback needs the stronger model | Once per session |
| Risk map (`premortemReport`) | **Sonnet 5** | Synthesizing the interview into a ranked risk map is the payoff — worth the spend | Once per session |
| Memory extraction (`/api/remember`) | **Sonnet 5** (reuses `analysis`) | Distilling durable, non-duplicate notes about a real person from a transcript rewards the stronger model | Once per session, optional |

**The rationale in one line:** the many cheap turns run on Haiku; the one expensive, high-value synthesis per session runs on Sonnet. Chat is where volume lives, so it gets the low per-token cost (Haiku ≈ \$1 / \$5 per M input/output); the report is where quality lives, so it gets Sonnet (≈ \$3 / \$15 per M) exactly once.

**Free daily cap.** On top of routing, `lib/usage.ts` enforces a per-day session limit (`FREE_DAILY_LIMIT`, default **3**), tracked client-side in `localStorage` and reset each calendar day. It's a friendly guardrail against runaway LLM spend for an MVP and doubles as the natural boundary for a future paywall. When you're out, the UI shows a calm over-limit message with a usage badge instead of letting you start another session.

---

## Project structure

```
rehearse/
├── app/
│   ├── api/
│   │   ├── roleplay/route.ts      # POST { scenario, messages, person? } -> { reply }  (Haiku)
│   │   ├── analyze/route.ts       # POST { scenario, messages } -> { report }   (Sonnet)
│   │   ├── premortem/route.ts     # POST { messages, action, decision? } -> reply | report
│   │   └── remember/route.ts      # POST { person, messages } -> { notes }      (Sonnet)
│   ├── globals.css
│   ├── layout.tsx                 # <html>/<body> shell, metadata
│   └── page.tsx                   # "use client" — full state machine (home/chat/report/people)
├── components/
│   ├── ModeTabs.tsx               # Conversation | Pre-Mortem toggle
│   ├── ScenarioPicker.tsx         # scenario cards
│   ├── PersonSelect.tsx           # attach a saved real person to a conversation
│   ├── PeopleManager.tsx          # add / edit / delete your people + read their memory
│   ├── MessageBubble.tsx
│   ├── ChatWindow.tsx             # scrollable, auto-scroll, typing indicator
│   ├── Composer.tsx               # textarea, Enter sends / Shift+Enter newline
│   ├── ReportCard.tsx             # graded conversation report
│   ├── PremortemReportCard.tsx    # risk map
│   └── UsageBadge.tsx             # used / limit
├── lib/
│   ├── types.ts                   # shared TS types (Scenario, Report, Session, Person, …)
│   ├── claude.ts                  # MODELS + complete() / completeJson() helpers
│   ├── prompts.ts                 # system prompts + transcript rendering
│   ├── scenarios.ts               # built-in scenario catalog
│   ├── store.ts                   # localStorage session persistence
│   ├── people.ts                  # localStorage people + memory (appendNotes)
│   └── usage.ts                   # free daily cap
├── .env.example                   # ANTHROPIC_API_KEY template
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts             # Tailwind v3, darkMode: media
└── tsconfig.json                  # strict, "@/*" -> project root
```

**Conventions:** Next.js 14 App Router, React 18, TypeScript strict, Tailwind v3 only (no UI/icon/animation/state libraries — emoji + utility classes). The only runtime dependency beyond Next/React is `@anthropic-ai/sdk`. Every API route is `runtime = "nodejs"` and returns `Response.json(...)`. Dark mode via Tailwind `dark:` variants; mobile-first throughout.

---

## Roadmap

- **Accounts + sync.** Memory of your real people already works locally — attach a person and the app learns them over time (see above). Next is signing in so those people and your session history sync across devices instead of living in a single browser.
- **Paywall on the analysis.** Keep unlimited-ish role-play cheap; put the high-value graded Report and risk map behind a paid tier (the free daily cap is already the seam for this).
- **Custom scenarios.** Let users describe their own situation and persona in a sentence and drop straight into a tailored role-play, beyond the built-in catalog.
- **Voice.** Speak your side and hear the other person talk back — the closest thing to the real, nervous-making moment.

---

## Metrics that matter

Two numbers tell us whether Rehearse actually helps:

- **Completion rate** — of sessions started, how many reach a finished Report or risk map. A started-but-abandoned session means the practice never paid off; this is the core "did it deliver value once" signal.
- **7-day return rate** — of people who finish a session, how many come back within a week. Hard conversations recur, and real behavior change comes from reps — so return rate is the truest read on whether this is a habit, not a one-time novelty.
