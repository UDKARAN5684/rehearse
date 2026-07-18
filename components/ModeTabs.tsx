"use client";

import type { Mode } from "@/lib/types";

const TABS: { value: Mode; label: string }[] = [
  { value: "conversation", label: "Conversation" },
  { value: "premortem", label: "Pre-Mortem" },
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
      className="flex items-center gap-8 border-b border-[color:var(--gray-200)] pb-0"
    >
      {TABS.map((tab) => {
        const active = tab.value === mode;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            data-active={active}
            onClick={() => onChange(tab.value)}
            className={[
              "wipe relative -mb-px cursor-pointer pb-3 text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--white)]",
              active ? "text-[color:var(--gray-900)]" : "text-[color:var(--gray-500)] hover:text-[color:var(--gray-900)]",
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
