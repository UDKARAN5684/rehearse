# Rehearse

**Practice the conversations and decisions that scare you, with an AI that pushes back.**

Rehearse is a small Next.js 14 app for getting reps on the hard stuff before it counts. It has two modes. **Conversation Simulator** lets you pick a tough scenario — asking for a raise, giving hard feedback, breaking up a partnership — and an AI role-plays the other person realistically while you practice; when you're done you get a graded, screenshot-worthy **Report** on what worked, what hurt you (with better lines to try instead), and the one thing to change next time. **Pre-Mortem** takes a big decision you're weighing and runs an imagined "fast-forward two years, this failed spectacularly, why?" interview one dimension at a time, then hands you a **risk map** — the story of the failure, ranked risks, and concrete inoculations for each.

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

## Model routing & cost

Rehearse routes each call to the cheapest model that's good enough for the job. The routing lives in `lib/claude.ts` (`MODELS`), so it's one place to tune.

| Job | Model | Why | Frequency |
|---|---|---|---|
| Role-play turns (`roleplay`) | **Haiku 4.5** (`claude-haiku-4-5`) | Fast, cheap, plenty good for staying in character turn-to-turn | Many per session |
| Pre-mortem interview turns (`premortem`) | **Haiku 4.5** | Same — one question at a time, low latency matters | Many per session |
| Post-game Report (`analysis`) | **Sonnet 5** (`claude-sonnet-5`) | Grading a whole transcript into structured, honest, quotable feedback needs the stronger model | Once per session |
| Risk map (`premortemReport`) | **Sonnet 5** | Synthesizing the interview into a ranked risk map is the payoff — worth the spend | Once per session |

**The rationale in one line:** the many cheap turns run on Haiku; the one expensive, high-value synthesis per session runs on Sonnet. Chat is where volume lives, so it gets the low per-token cost (Haiku ≈ \$1 / \$5 per M input/output); the report is where quality lives, so it gets Sonnet (≈ \$3 / \$15 per M) exactly once.

**Free daily cap.** On top of routing, `lib/usage.ts` enforces a per-day session limit (`FREE_DAILY_LIMIT`, default **3**), tracked client-side in `localStorage` and reset each calendar day. It's a friendly guardrail against runaway LLM spend for an MVP and doubles as the natural boundary for a future paywall. When you're out, the UI shows a calm over-limit message with a usage badge instead of letting you start another session.

---

## Project structure

```
rehearse/
├── app/
│   ├── api/
│   │   ├── roleplay/route.ts      # POST { scenario, messages } -> { reply }   (Haiku)
│   │   ├── analyze/route.ts       # POST { scenario, messages } -> { report }  (Sonnet)
│   │   └── premortem/route.ts     # POST { messages, action, decision? } -> reply | report
│   ├── globals.css
│   ├── layout.tsx                 # <html>/<body> shell, metadata
│   └── page.tsx                   # "use client" — full state machine (home/chat/report)
├── components/
│   ├── ModeTabs.tsx               # Conversation | Pre-Mortem toggle
│   ├── ScenarioPicker.tsx         # scenario cards
│   ├── MessageBubble.tsx
│   ├── ChatWindow.tsx             # scrollable, auto-scroll, typing indicator
│   ├── Composer.tsx               # textarea, Enter sends / Shift+Enter newline
│   ├── ReportCard.tsx             # graded conversation report
│   ├── PremortemReportCard.tsx    # risk map
│   └── UsageBadge.tsx             # used / limit
├── lib/
│   ├── types.ts                   # shared TS types (Scenario, Report, Session, …)
│   ├── claude.ts                  # MODELS + complete() / completeJson() helpers
│   ├── prompts.ts                 # system prompts + transcript rendering
│   ├── scenarios.ts               # built-in scenario catalog
│   ├── store.ts                   # localStorage session persistence
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

- **Accounts + memory of your real people.** Sign in, then rehearse against personas that remember your actual manager, co-founder, or partner across sessions — so practice compounds instead of resetting each time.
- **Paywall on the analysis.** Keep unlimited-ish role-play cheap; put the high-value graded Report and risk map behind a paid tier (the free daily cap is already the seam for this).
- **Custom scenarios.** Let users describe their own situation and persona in a sentence and drop straight into a tailored role-play, beyond the built-in catalog.
- **Voice.** Speak your side and hear the other person talk back — the closest thing to the real, nervous-making moment.

---

## Metrics that matter

Two numbers tell us whether Rehearse actually helps:

- **Completion rate** — of sessions started, how many reach a finished Report or risk map. A started-but-abandoned session means the practice never paid off; this is the core "did it deliver value once" signal.
- **7-day return rate** — of people who finish a session, how many come back within a week. Hard conversations recur, and real behavior change comes from reps — so return rate is the truest read on whether this is a habit, not a one-time novelty.
