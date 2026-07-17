"use client";

import type { PremortemReport, RiskLevel } from "@/lib/types";
import Icon from "@/components/Icon";

const RISK_STYLES: Record<
  RiskLevel,
  { chip: string; bar: string; label: string }
> = {
  low: {
    chip: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
    bar: "bg-emerald-500",
    label: "Low risk",
  },
  medium: {
    chip: "bg-amber-500/12 text-amber-600 dark:text-amber-300",
    bar: "bg-amber-500",
    label: "Medium risk",
  },
  high: {
    chip: "bg-rose-500/12 text-rose-600 dark:text-rose-300",
    bar: "bg-rose-500",
    label: "High risk",
  },
};

// Guard against off-spec model output (capitalized, "moderate", missing).
function normalizeRisk(value: unknown): RiskLevel {
  const v = typeof value === "string" ? value.trim().toLowerCase() : "";
  return v === "low" || v === "high" ? v : "medium";
}

function RiskChip({ level }: { level: RiskLevel }) {
  const lvl = normalizeRisk(level);
  const s = RISK_STYLES[lvl];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${s.chip}`}
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

  const card = "rounded-4xl border border-border bg-surface p-6 shadow-card";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      {/* Header: decision + overall risk */}
      <div
        className="animate-fade-up rounded-4xl border border-border bg-surface p-6 shadow-card"
        style={{ animationDelay: "0ms" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-muted">
              Pre-mortem risk map
            </p>
            <h2 className="mt-1.5 font-display text-xl font-bold leading-snug text-fg">
              {report.decision}
            </h2>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold capitalize ${overall.chip}`}
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
      <section
        className={`animate-fade-up ${card}`}
        style={{ animationDelay: "80ms" }}
      >
        <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
          <Icon name="trendDown" size={17} className="text-rose-500" /> How it
          could fail
        </h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-fg/85">
          {report.storyOfFailure}
        </p>
      </section>

      {/* Risks */}
      {risks.length > 0 && (
        <section
          className={`animate-fade-up ${card}`}
          style={{ animationDelay: "160ms" }}
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
            <Icon name="alert" size={17} className="text-amber-500" /> Risk
            breakdown
          </h3>
          <div className="mt-4 space-y-3">
            {risks.map((r, i) => (
              <div
                key={i}
                className="rounded-3xl border border-border bg-surface-2 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-fg">{r.dimension}</h4>
                  <RiskChip level={r.likelihood} />
                </div>
                <p className="mt-2 text-sm text-muted">{r.failure}</p>
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-accent-soft px-3.5 py-2.5 text-sm text-fg ring-1 ring-inset ring-accent/15">
                  <Icon
                    name="shield"
                    size={16}
                    className="mt-0.5 shrink-0 text-accent"
                  />
                  <span>
                    <span className="font-semibold text-accent">
                      Inoculate:{" "}
                    </span>
                    {r.inoculation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top inoculations — standout gradient call-out */}
      {topInoculations.length > 0 && (
        <section
          className="animate-fade-up overflow-hidden rounded-4xl bg-accent p-6 text-accent-fg shadow-glow"
          style={{ animationDelay: "240ms" }}
        >
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-fg/75">
            <Icon name="shield" size={15} /> Do these now
          </p>
          <ol className="mt-3 space-y-2.5">
            {topInoculations.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm font-medium leading-snug">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-fg/20 text-xs font-bold"
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
        className="mx-auto mt-1 inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-fg transition-all hover:shadow-glow-sm active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
Run another pre-mortem <Icon name="arrowRight" size={15} strokeWidth={2.25} />
      </button>
    </div>
  );
}
