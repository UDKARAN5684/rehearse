"use client";

import type { PremortemReport, RiskLevel } from "@/lib/types";

const RISK_STYLES: Record<
  RiskLevel,
  { chip: string; bar: string; label: string }
> = {
  low: {
    chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    bar: "bg-emerald-500",
    label: "Low risk",
  },
  medium: {
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    bar: "bg-amber-500",
    label: "Medium risk",
  },
  high: {
    chip: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    bar: "bg-rose-500",
    label: "High risk",
  },
};

// The model is only prompted to emit low|medium|high; guard against anything
// off-spec (capitalized, "moderate", missing) so a bad value can't crash render.
function normalizeRisk(value: unknown): RiskLevel {
  const v = typeof value === "string" ? value.trim().toLowerCase() : "";
  return v === "low" || v === "high" ? v : "medium";
}

function RiskChip({ level }: { level: RiskLevel }) {
  const lvl = normalizeRisk(level);
  const s = RISK_STYLES[lvl];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${s.chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.bar}`} aria-hidden="true" />
      {lvl}
    </span>
  );
}

export default function PremortemReportCard({
  report,
  onRestart,
}: {
  report: PremortemReport;
  onRestart: () => void;
}) {
  const overallLevel = normalizeRisk(report.overallRisk);
  const overall = RISK_STYLES[overallLevel];
  const risks = Array.isArray(report.risks) ? report.risks : [];
  const topInoculations = Array.isArray(report.topInoculations)
    ? report.topInoculations
    : [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      {/* Header: decision + overall risk */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Pre-mortem risk map
            </p>
            <h2 className="mt-1 text-xl font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
              {report.decision}
            </h2>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold capitalize ${overall.chip}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${overall.bar}`}
              aria-hidden="true"
            />
            {overallLevel}
          </span>
        </div>
      </div>

      {/* Story of failure */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          <span aria-hidden="true">📉</span> How it could fail
        </h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {report.storyOfFailure}
        </p>
      </section>

      {/* Risks */}
      {risks.length > 0 && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            <span aria-hidden="true">⚠️</span> Risk breakdown
          </h3>
          <div className="mt-4 space-y-3">
            {risks.map((r, i) => (
              <div
                key={i}
                className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {r.dimension}
                  </h4>
                  <RiskChip level={r.likelihood} />
                </div>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {r.failure}
                </p>
                <div className="mt-3 flex gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900 ring-1 ring-inset ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-500/20">
                  <span aria-hidden="true">💉</span>
                  <span>
                    <span className="font-semibold">Inoculate: </span>
                    {r.inoculation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top inoculations — standout call-out */}
      {topInoculations.length > 0 && (
        <section className="rounded-2xl border border-indigo-200 bg-indigo-600 p-6 text-white shadow-sm dark:border-indigo-500/40">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-200">
            <span aria-hidden="true">🛡️</span> Do these now
          </p>
          <ol className="mt-3 space-y-2.5">
            {topInoculations.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm font-medium leading-snug">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <button
        type="button"
        onClick={onRestart}
        className="mx-auto mt-1 inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <span aria-hidden="true">↺</span> Run another pre-mortem
      </button>
    </div>
  );
}
