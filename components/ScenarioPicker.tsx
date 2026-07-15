"use client";

import type { Scenario, Difficulty } from "@/lib/types";

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  realistic: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

export default function ScenarioPicker({
  scenarios,
  onPick,
  disabled,
}: {
  scenarios: Scenario[];
  onPick: (s: Scenario) => void;
  disabled?: boolean;
}) {
  if (scenarios.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        No scenarios available yet. Check back soon.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {scenarios.map((s) => (
        <button
          key={s.id}
          type="button"
          disabled={disabled}
          onClick={() => onPick(s)}
          className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 text-left transition-all hover:border-indigo-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-neutral-200 disabled:hover:shadow-none dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-indigo-500/60 dark:disabled:hover:border-neutral-800"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="text-3xl leading-none" aria-hidden="true">
              {s.emoji}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${DIFFICULTY_STYLES[s.difficulty]}`}
            >
              {s.difficulty}
            </span>
          </div>

          <h3 className="mt-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {s.title}
          </h3>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            {s.category}
          </p>
          <p className="mt-2 flex-1 text-sm text-neutral-600 dark:text-neutral-400">
            {s.blurb}
          </p>

          <div className="mt-4 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <span aria-hidden="true">🎭</span>
            <span>
              vs{" "}
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {s.personaName}
              </span>
              , {s.personaRole}
            </span>
          </div>

          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Start rehearsal
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
