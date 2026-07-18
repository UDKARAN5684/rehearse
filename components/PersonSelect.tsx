"use client";
// Editorial control on the conversation home: choose whether to practice with a
// generic persona or as one of your saved real people. Reads as a masthead
// choice on a hairline, not a boxed form field.
import type { Person } from "@/lib/types";
import Icon from "@/components/Icon";

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
  const hasPeople = people.length > 0;

  return (
    <div className="flex flex-col gap-4 border-t border-[color:var(--gray-200)] pt-4">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <label
          htmlFor="person-select"
          className="text-xs font-bold uppercase tracking-widest text-muted"
        >
          Who you&rsquo;re talking to
        </label>
        <button
          type="button"
          onClick={onManage}
          className="wipe inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[color:var(--gray-900)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--white)]"
        >
          {hasPeople ? "Manage people" : "Add a real person"}
          <Icon
            name={hasPeople ? "users" : "arrowRight"}
            size={13}
            strokeWidth={2}
          />
        </button>
      </div>

      <div className="relative">
        <select
          id="person-select"
          value={selectedId ?? ""}
          disabled={disabled}
          onChange={(e) => onSelect(e.target.value || null)}
          className="w-full cursor-pointer appearance-none border-b border-[color:var(--gray-300)] bg-transparent py-2 pr-8 font-display text-xl tracking-tight text-[color:var(--gray-900)] outline-none transition-colors hover:border-[color:var(--gray-500)] focus-visible:border-[color:var(--gray-900)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Just practice &mdash; a generic person</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.relationship}
            </option>
          ))}
        </select>
        <Icon
          name="chevronDown"
          size={18}
          className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[color:var(--gray-500)]"
        />
      </div>

      <p className="text-sm text-muted">
        {selected
          ? `The AI plays ${selected.name} and learns from each session.`
          : "Add a real person and the AI will play them, not a generic stand-in."}
      </p>
    </div>
  );
}
