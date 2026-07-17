"use client";

import type { Mode } from "@/lib/types";
import Icon from "@/components/Icon";

const TABS: { value: Mode; label: string; icon: string }[] = [
  { value: "conversation", label: "Conversation", icon: "chat" },
  { value: "premortem", label: "Pre-Mortem", icon: "target" },
];

export default function ModeTabs({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  const activeIndex = Math.max(
    0,
    TABS.findIndex((t) => t.value === mode),
  );

  return (
    <div
      role="tablist"
      aria-label="Choose a mode"
      className="relative grid grid-cols-2 gap-1 rounded-2xl border border-border bg-surface-2 p-1"
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-xl bg-surface shadow-sm ring-1 ring-border transition-transform duration-300"
        style={{
          width: "calc(50% - 0.25rem)",
          transform: `translateX(${activeIndex * 100}%)`,
          transitionTimingFunction: "cubic-bezier(.21,1.02,.73,1)",
        }}
      />
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
              "relative z-10 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              active ? "text-fg" : "text-muted hover:text-fg",
            ].join(" ")}
          >
            <Icon name={tab.icon} size={17} className={active ? "text-accent" : ""} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
