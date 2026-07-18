"use client";

import { useMemo, useState } from "react";
import type { Scenario, Difficulty } from "@/lib/types";
import Icon, { categoryIcon } from "@/components/Icon";
import { motion, type Variants } from "framer-motion";

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  easy: "bg-emerald-500",
  realistic: "bg-amber-500",
  hard: "bg-rose-500",
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 240, damping: 24 },
  },
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
  const [filter, setFilter] = useState<string>("all");

  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const s of scenarios) if (!seen.includes(s.category)) seen.push(s.category);
    return ["all", ...seen];
  }, [scenarios]);

  const visible =
    filter === "all"
      ? scenarios
      : scenarios.filter((s) => s.category === filter);

  if (scenarios.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[color:var(--gray-200)] p-10 text-center text-sm text-[color:var(--gray-500)]">
        No scenarios available yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Category filter — wipe-underline toggle group */}
      <div
        role="group"
        aria-label="Filter scenarios by category"
        className="flex flex-wrap items-center gap-x-6 gap-y-2"
      >
        {categories.map((c) => {
          const active = filter === c;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={active}
              data-active={active}
              onClick={() => setFilter(c)}
              className={[
                "wipe relative cursor-pointer pb-1 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--white)]",
                active
                  ? "text-[color:var(--gray-900)]"
                  : "text-[color:var(--gray-500)] hover:text-[color:var(--gray-900)]",
              ].join(" ")}
            >
              {c === "all" ? "All" : c}
            </button>
          );
        })}
      </div>

      {/* Hairline gallery grid */}
      <motion.div
        key={filter}
        className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[color:var(--gray-200)] bg-[color:var(--gray-200)] sm:grid-cols-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {visible.map((s) => (
          <motion.button
            key={s.id}
            type="button"
            disabled={disabled}
            onClick={() => onPick(s)}
            variants={item}
            className="group relative flex min-h-[176px] cursor-pointer flex-col justify-between bg-[color:var(--white)] p-6 text-left transition-colors duration-300 hover:bg-[color:var(--gray-50)] focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[color:var(--gray-500)]">
                <Icon name={categoryIcon(s.category)} size={15} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                  {s.category}
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-medium capitalize text-[color:var(--gray-500)]">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${DIFFICULTY_DOT[s.difficulty]}`}
                  aria-hidden
                />
                {s.difficulty}
              </span>
            </div>

            <div className="mt-6">
              <h3 className="font-display text-xl font-semibold tracking-tight text-[color:var(--gray-900)]">
                {s.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-sm text-[color:var(--gray-500)]">
                {s.blurb}
              </p>
              <span className="mt-3 flex translate-x-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--gray-900)] opacity-100 transition-all duration-300 sm:-translate-x-1 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
                Rehearse
                <Icon name="arrowRight" size={13} strokeWidth={2} />
              </span>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
