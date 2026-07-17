"use client";

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
  show: { transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 240, damping: 22 },
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
  if (scenarios.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted">
        No scenarios available yet.
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {scenarios.map((s) => (
        <motion.button
          key={s.id}
          type="button"
          disabled={disabled}
          onClick={() => onPick(s)}
          variants={item}
          whileHover={disabled ? undefined : { y: -5 }}
          whileTap={disabled ? undefined : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          className="group flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-5 text-left shadow-card transition-colors hover:border-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="flex items-center justify-between">
            <motion.span
              className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent"
              whileHover={disabled ? undefined : { rotate: -8, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Icon name={categoryIcon(s.category)} size={19} />
            </motion.span>
            <span className="flex items-center gap-1.5 text-xs font-medium capitalize text-muted">
              <span
                className={`h-1.5 w-1.5 rounded-full ${DIFFICULTY_DOT[s.difficulty]}`}
                aria-hidden
              />
              {s.difficulty}
            </span>
          </div>
          <div>
            <h3 className="font-display font-bold tracking-tight text-fg">
              {s.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{s.blurb}</p>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}
