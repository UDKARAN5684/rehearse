"use client";
// Compact control on the conversation home: choose whether to practice with a
// generic persona or as one of your saved real people.
import type { Person } from "@/lib/types";

interface PersonSelectProps {
  people: Person[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onManage: () => void;
  disabled?: boolean;
}

export default function PersonSelect({
  people,
  selectedId,
  onSelect,
  onManage,
  disabled,
}: PersonSelectProps) {
  const selected = people.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="rounded-3xl border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="person-select"
          className="text-sm font-semibold text-fg"
        >
          Who are you talking to?
        </label>
        <button
          type="button"
          onClick={onManage}
          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {people.length > 0 ? "Manage people" : "+ Add a real person"}
        </button>
      </div>

      <div className="mt-2.5">
        <select
          id="person-select"
          value={selectedId ?? ""}
          disabled={disabled}
          onChange={(e) => onSelect(e.target.value || null)}
          className="w-full rounded-2xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-fg outline-none transition-all focus:border-accent/60 focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
        >
          <option value="">Just practice (generic person)</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.relationship}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-2 text-xs text-muted">
        {selected
          ? `The AI plays ${selected.name} and learns from each session.`
          : "Add a real person and the AI will play them."}
      </p>
    </div>
  );
}
