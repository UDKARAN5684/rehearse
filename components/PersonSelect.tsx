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
    <div className="rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="person-select"
          className="text-sm font-medium text-neutral-600 dark:text-neutral-300"
        >
          Who are you talking to?
        </label>
        <button
          type="button"
          onClick={onManage}
          className="rounded-lg px-2.5 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
        >
          {people.length > 0 ? "Manage people" : "+ Add a real person"}
        </button>
      </div>

      <div className="mt-2">
        <select
          id="person-select"
          value={selectedId ?? ""}
          disabled={disabled}
          onChange={(e) => onSelect(e.target.value || null)}
          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
        >
          <option value="">Just practice (generic person)</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.relationship}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
        {selected
          ? `The AI will play ${selected.name}, and remember what it learns for next time.`
          : "Add someone from your real life and the AI will play them — getting more accurate every session."}
      </p>
    </div>
  );
}
