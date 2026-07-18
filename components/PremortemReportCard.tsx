"use client";

import type { PremortemReport, RiskLevel } from "@/lib/types";
import Icon from "@/components/Icon";

// Risk keeps a single semantic dot colour (like the difficulty dots); everything
// else stays editorial monochrome.
const RISK_DOT: Record<RiskLevel, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-rose-500",
};

// Guard against off-spec model output (capitalized, "moderate", missing).
function normalizeRisk(value: unknown): RiskLevel {
  const v = typeof value === "string" ? value.trim().toLowerCase() : "";
  return v === "low" || v === "high" ? v : "medium";
}

function RiskChip({ level }: { level: RiskLevel }) {
  const lvl = normalizeRisk(level);
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[color:var(--gray-200)] px-2.5 py-0.5 text-xs font-semibold capitalize text-[color:var(--gray-600)]">
      <span className={`h-1.5 w-1.5 rounded-full ${RISK_DOT[lvl]}`} aria-hidden="true" />
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
  const risks = Array.isArray(report.risks) ? report.risks : [];
  const topInoculations = Array.isArray(report.topInoculations)
    ? report.topInoculations
    : [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      {/* Header: decision + overall risk */}
      <div className="flex animate-fade-up items-start justify-between gap-4 border-b border-[color:var(--gray-200)] pb-8">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--gray-500)]">
            Pre-mortem risk map
          </p>
          <h2 className="mt-2 font-display text-xl font-bold leading-snug tracking-tight text-[color:var(--gray-900)] sm:text-2xl">
            {report.decision}
          </h2>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[color:var(--gray-200)] px-3 py-1 text-sm font-bold capitalize text-[color:var(--gray-700)]">
          <span
            className={`h-2 w-2 rounded-full ${RISK_DOT[overallLevel]}`}
            aria-hidden="true"
          />
          {overallLevel}
        </span>
      </div>

      {/* Story of failure */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-[color:var(--gray-500)]">
          How it could fail
        </h3>
        <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-[color:var(--gray-700)]">
          {report.storyOfFailure}
        </p>
      </section>

      {/* Risks */}
      {risks.length > 0 && (
        <section className="border-t border-[color:var(--gray-200)] pt-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[color:var(--gray-500)]">
            Risk breakdown
          </h3>
          <div className="mt-4 space-y-4">
            {risks.map((r, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[color:var(--gray-200)] bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-display text-[15px] font-bold tracking-tight text-[color:var(--gray-900)]">
                    {r.dimension}
                  </h4>
                  <RiskChip level={r.likelihood} />
                </div>
                <p className="mt-2 text-sm text-muted">{r.failure}</p>
                <div className="mt-3 flex items-start gap-2 border-t border-[color:var(--gray-200)] pt-3 text-sm text-[color:var(--gray-700)]">
                  <Icon
                    name="shield"
                    size={16}
                    className="mt-0.5 shrink-0 text-[color:var(--gray-900)]"
                  />
                  <span>
                    <span className="font-bold uppercase tracking-[0.1em] text-[color:var(--gray-500)]">
                      Inoculate{" "}
                    </span>
                    {r.inoculation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top inoculations — ink callout */}
      {topInoculations.length > 0 && (
        <section className="ink rounded-2xl p-6">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60">
            <Icon name="shield" size={15} /> Do these now
          </p>
          <ol className="mt-3 space-y-2.5">
            {topInoculations.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm font-medium leading-snug">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold"
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
        className="mx-auto inline-flex items-center gap-2 rounded-full border border-[color:var(--gray-300)] bg-white px-5 py-2.5 text-sm font-semibold text-[color:var(--gray-900)] transition-colors hover:border-[color:var(--gray-900)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Run another pre-mortem <Icon name="arrowRight" size={15} strokeWidth={2.25} />
      </button>
    </div>
  );
}
