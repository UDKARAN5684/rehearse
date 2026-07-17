"use client";

import { useEffect, useState } from "react";
import type { Report } from "@/lib/types";
import Icon from "@/components/Icon";

function scoreTheme(score: number): { stroke: string; text: string; label: string } {
  if (score >= 75)
    return {
      stroke: "#10b981",
      text: "text-emerald-500",
      label: "Strong showing",
    };
  if (score >= 50)
    return { stroke: "#f59e0b", text: "text-amber-500", label: "Getting there" };
  return { stroke: "#f43f5e", text: "text-rose-500", label: "Room to grow" };
}

function ScoreRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const theme = scoreTheme(clamped);
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
          strokeWidth="9"
          className="stroke-border"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          strokeWidth="9"
          stroke={theme.stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.21,1.02,.73,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-display text-4xl font-bold tabular-nums ${theme.text}`}
        >
          {num}
        </span>
        <span className="text-[11px] font-medium text-muted">/ 100</span>
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

  const card =
    "rounded-4xl border border-border bg-surface p-6 shadow-card";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      {/* Score + headline */}
      <div
        className="animate-fade-up rounded-4xl border border-border bg-surface p-6 shadow-card"
        style={{ animationDelay: "0ms" }}
      >
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <ScoreRing score={report.overallScore} />
          <div className="flex-1">
            <p
              className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}
            >
              {theme.label}
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold leading-tight text-fg">
              {report.headline}
            </h2>
            <p className="mt-2 text-sm text-muted">Your post-game report</p>
          </div>
        </div>
      </div>

      {/* What worked */}
      {wentWell.length > 0 && (
        <section
          className={`animate-fade-up ${card}`}
          style={{ animationDelay: "80ms" }}
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
            <Icon name="check" size={17} className="text-emerald-500" /> What
            worked
          </h3>
          <ul className="mt-3 space-y-2">
            {wentWell.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-fg/85">
                <span aria-hidden="true" className="mt-0.5 text-emerald-500">
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
        <section
          className={`animate-fade-up ${card}`}
          style={{ animationDelay: "160ms" }}
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
            <Icon name="search" size={17} className="text-accent" /> What hurt
            you
          </h3>
          <div className="mt-4 space-y-4">
            {hurtYou.map((h, i) => (
              <div
                key={i}
                className="rounded-3xl border border-border bg-surface-2 p-4"
              >
                <blockquote className="border-l-2 border-rose-400 pl-3 text-sm italic text-fg/80">
                  “{h.quote}”
                </blockquote>
                <p className="mt-2.5 text-sm text-muted">{h.why}</p>
                <div className="mt-3 rounded-2xl bg-accent-soft px-3.5 py-2.5 text-sm text-fg ring-1 ring-inset ring-accent/20">
                  <span className="font-semibold text-accent">
                    Try instead:{" "}
                  </span>
                  {h.tryInstead}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Missed moves */}
      {missedMoves.length > 0 && (
        <section
          className={`animate-fade-up ${card}`}
          style={{ animationDelay: "240ms" }}
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
            <Icon name="crosshair" size={17} className="text-muted" /> Missed
            moves
          </h3>
          <ul className="mt-3 space-y-2">
            {missedMoves.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-fg/85">
                <span aria-hidden="true" className="mt-0.5 text-muted">
                  →
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* One thing next time — standout gradient call-out */}
      <section
        className="animate-fade-up overflow-hidden rounded-4xl bg-accent p-6 text-accent-fg shadow-glow"
        style={{ animationDelay: "320ms" }}
      >
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-fg/75">
          <Icon name="spark" size={15} /> One thing next time
        </p>
        <p className="mt-2 font-display text-xl font-bold leading-snug">
          {report.oneThingNextTime}
        </p>
      </section>

      <button
        type="button"
        onClick={onRestart}
        className="mx-auto mt-1 inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-fg transition-all hover:shadow-glow-sm active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
Rehearse again <Icon name="arrowRight" size={15} strokeWidth={2.25} />
      </button>
    </div>
  );
}
