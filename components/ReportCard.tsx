"use client";

import { useEffect, useState } from "react";
import type { Report } from "@/lib/types";
import Icon from "@/components/Icon";

// Score still carries a small semantic accent (the one place colour is allowed,
// like the difficulty dots) — but the ring itself stays editorial monochrome.
function scoreTheme(score: number): { dot: string; label: string } {
  if (score >= 75) return { dot: "bg-emerald-500", label: "Strong session" };
  if (score >= 50) return { dot: "bg-amber-500", label: "Getting there" };
  return { dot: "bg-rose-500", label: "Room to grow" };
}

function ScoreRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 54;
  const circ = 2 * Math.PI * radius;

  const [filled, setFilled] = useState(false);
  const [num, setNum] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 80);
    let raf = 0;
    const dur = 1000;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setNum(Math.round(eased * clamped));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [clamped]);

  const offset = filled ? circ * (1 - clamped / 100) : circ;

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          strokeWidth="7"
          stroke="var(--gray-200)"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          strokeWidth="7"
          stroke="var(--gray-900)"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.21,1.02,.73,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-bold tabular-nums text-[color:var(--gray-900)]">
          {num}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
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
  const wentWell = Array.isArray(report.wentWell) ? report.wentWell : [];
  const hurtYou = Array.isArray(report.hurtYou) ? report.hurtYou : [];
  const missedMoves = Array.isArray(report.missedMoves) ? report.missedMoves : [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      {/* Score + headline */}
      <div className="flex animate-fade-up flex-col items-center gap-6 border-b border-[color:var(--gray-200)] pb-8 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
        <ScoreRing score={report.overallScore} />
        <div className="flex-1">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[color:var(--gray-500)]">
            <span
              className={`h-1.5 w-1.5 rounded-full ${theme.dot}`}
              aria-hidden
            />
            {theme.label}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-[color:var(--gray-900)] sm:text-3xl">
            {report.headline}
          </h2>
          <p className="mt-2 text-sm text-muted">Your rehearsal report</p>
        </div>
      </div>

      {/* What worked */}
      {wentWell.length > 0 && (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[color:var(--gray-500)]">
            What worked
          </h3>
          <ul className="mt-4 space-y-3">
            {wentWell.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 text-[15px] leading-relaxed text-[color:var(--gray-700)]"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-[color:var(--gray-900)]"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* What hurt you */}
      {hurtYou.length > 0 && (
        <section className="border-t border-[color:var(--gray-200)] pt-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[color:var(--gray-500)]">
            What hurt you
          </h3>
          <div className="mt-4 space-y-4">
            {hurtYou.map((h, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[color:var(--gray-200)] bg-white p-4"
              >
                <blockquote className="border-l-2 border-[color:var(--gray-900)] pl-3 font-display text-[15px] italic text-[color:var(--gray-700)]">
                  &ldquo;{h.quote}&rdquo;
                </blockquote>
                <p className="mt-2.5 text-sm text-muted">{h.why}</p>
                <div className="mt-3 border-t border-[color:var(--gray-200)] pt-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--gray-500)]">
                    Try instead
                  </span>
                  <p className="mt-1 font-display text-[15px] leading-snug text-[color:var(--gray-900)]">
                    &ldquo;{h.tryInstead}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Missed moves */}
      {missedMoves.length > 0 && (
        <section className="border-t border-[color:var(--gray-200)] pt-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[color:var(--gray-500)]">
            Missed moves
          </h3>
          <ul className="mt-4 space-y-3">
            {missedMoves.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 text-[15px] leading-relaxed text-[color:var(--gray-700)]"
              >
                <Icon
                  name="arrowRight"
                  size={15}
                  strokeWidth={2}
                  className="mt-1 shrink-0 text-[color:var(--gray-400)]"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* One thing next time — ink callout */}
      <section className="ink rounded-2xl p-6">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60">
          <Icon name="spark" size={15} /> One thing next time
        </p>
        <p className="mt-2 font-display text-xl font-bold leading-snug">
          {report.oneThingNextTime}
        </p>
      </section>

      <button
        type="button"
        onClick={onRestart}
        className="mx-auto inline-flex items-center gap-2 rounded-full border border-[color:var(--gray-300)] bg-white px-5 py-2.5 text-sm font-semibold text-[color:var(--gray-900)] transition-colors hover:border-[color:var(--gray-900)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Rehearse again <Icon name="arrowRight" size={15} strokeWidth={2.25} />
      </button>
    </div>
  );
}
