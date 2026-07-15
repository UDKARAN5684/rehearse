"use client";

import type { Mode } from "@/lib/types";

const TABS: { value: Mode; label: string; emoji: string }[] = [
  { value: "conversation", label: "Conversation", emoji: "💬" },
  { value: "premortem", label: "Pre-Mortem", emoji: "🔮" },
];

export default function ModeTabs({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Choose a mode"
      className="inline-flex w-full items-center gap-1 rounded-2xl border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900 sm:w-auto"
    >
      {TABS.map((tab) => {
        const active = tab.value === mode;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={[
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:flex-none",
              active
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
            ].join(" ")}
          >
            <span aria-hidden="true">{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
