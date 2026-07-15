"use client";

import type { Report } from "@/lib/types";

function scoreTheme(score: number): {
  stroke: string;
  text: string;
  label: string;
} {
  if (score >= 75)
    return {
      stroke: "#10b981",
      text: "text-emerald-600 dark:text-emerald-400",
      label: "Strong showing",
    };
  if (score >= 50)
    return {
      stroke: "#f59e0b",
      text: "text-amber-600 dark:text-amber-400",
      label: "Getting there",
    };
  return {
    stroke: "#f43f5e",
    text: "text-rose-600 dark:text-rose-400",
    label: "Room to grow",
  };
}

function ScoreRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const theme = scoreTheme(clamped);
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - clamped / 100);

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="8"
          className="stroke-neutral-200 dark:stroke-neutral-800"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="8"
          stroke={theme.stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold tabular-nums ${theme.text}`}>
          {clamped}
        </span>
        <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
          / 100
        </span>
      </div>
    </div>
  );
}

export default function ReportCard({
  report,
  onRestart,
}: {
  report: Report;
  onRestart: () => void;
}) {
  const theme = scoreTheme(Math.round(report.overallScore));
  // completeJson only JSON.parses model output; default arrays so a missing or
  // malformed field can't crash render.
  const wentWell = Array.isArray(report.wentWell) ? report.wentWell : [];
  const hurtYou = Array.isArray(report.hurtYou) ? report.hurtYou : [];
  const missedMoves = Array.isArray(report.missedMoves)
    ? report.missedMoves
    : [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      {/* Score + headline */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <ScoreRing score={report.overallScore} />
          <div className="flex-1">
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${theme.text}`}
            >
              {theme.label}
            </p>
            <h2 className="mt-1 text-xl font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
              {report.headline}
            </h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Your post-game report
            </p>
          </div>
        </div>
      </div>

      {/* What worked */}
      {wentWell.length > 0 && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            <span aria-hidden="true">✅</span> What worked
          </h3>
          <ul className="mt-3 space-y-2">
            {wentWell.map((item, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-sm text-neutral-700 dark:text-neutral-300"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 text-emerald-500 dark:text-emerald-400"
                >
                  ●
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* What hurt you */}
      {hurtYou.length > 0 && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            <span aria-hidden="true">🔍</span> What hurt you
          </h3>
          <div className="mt-4 space-y-4">
            {hurtYou.map((h, i) => (
              <div
                key={i}
                className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/40"
              >
                <blockquote className="border-l-2 border-rose-300 pl-3 text-sm italic text-neutral-700 dark:border-rose-500/50 dark:text-neutral-300">
                  “{h.quote}”
                </blockquote>
                <p className="mt-2.5 text-sm text-neutral-600 dark:text-neutral-400">
                  {h.why}
                </p>
                <div className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900 ring-1 ring-inset ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-500/20">
                  <span className="font-semibold">Try instead: </span>
                  {h.tryInstead}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Missed moves */}
      {missedMoves.length > 0 && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            <span aria-hidden="true">🎯</span> Missed moves
          </h3>
          <ul className="mt-3 space-y-2">
            {missedMoves.map((item, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-sm text-neutral-700 dark:text-neutral-300"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 text-neutral-400 dark:text-neutral-500"
                >
                  →
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* One thing next time — standout call-out */}
      <section className="rounded-2xl border border-indigo-200 bg-indigo-600 p-6 text-white shadow-sm dark:border-indigo-500/40">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-200">
          <span aria-hidden="true">⭐</span> One thing next time
        </p>
        <p className="mt-2 text-lg font-medium leading-snug">
          {report.oneThingNextTime}
        </p>
      </section>

      <button
        type="button"
        onClick={onRestart}
        className="mx-auto mt-1 inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <span aria-hidden="true">↺</span> Rehearse again
      </button>
    </div>
  );
}
