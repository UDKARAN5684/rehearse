"use client";
// Full-screen management of the user's real people: add, edit, delete, and read
// the memory the app has accumulated about each of them.
import { useState } from "react";
import type { Person } from "@/lib/types";
import { newId } from "@/lib/store";

interface PeopleManagerProps {
  people: Person[];
  onSave: (person: Person) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

interface Draft {
  id: string | null;
  name: string;
  relationship: string;
  notes: string;
}

const EMPTY: Draft = { id: null, name: "", relationship: "", notes: "" };

const PRIMARY_BTN =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-[color:var(--gray-900)] text-white px-5 py-2.5 text-sm font-semibold tracking-tight transition-colors hover:bg-[color:var(--gray-700)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--white)] disabled:cursor-not-allowed disabled:opacity-50";

const GHOST_BTN =
  "rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-[color:var(--gray-100)] hover:text-[color:var(--gray-900)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

const FIELD =
  "w-full rounded-xl border border-[color:var(--gray-300)] bg-white px-3.5 py-2.5 text-sm text-fg outline-none transition-colors placeholder:text-[color:var(--gray-400)] focus:border-[color:var(--gray-900)]";

export default function PeopleManager({
  people,
  onSave,
  onDelete,
  onBack,
}: PeopleManagerProps) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null,
  );
  const editing = draft.id !== null;

  function submit() {
    const name = draft.name.trim();
    const relationship = draft.relationship.trim();
    if (!name || !relationship) return;
    const now = Date.now();
    if (editing) {
      const existing = people.find((p) => p.id === draft.id);
      onSave({
        id: draft.id as string,
        name,
        relationship,
        notes: draft.notes,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      });
    } else {
      onSave({
        id: newId(),
        name,
        relationship,
        notes: draft.notes.trim(),
        createdAt: now,
        updatedAt: now,
      });
    }
    setDraft(EMPTY);
  }

  function startEdit(p: Person) {
    setDraft({
      id: p.id,
      name: p.name,
      relationship: p.relationship,
      notes: p.notes,
    });
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 py-6 pb-12">
      <div className="flex items-start justify-between gap-4 border-b border-[color:var(--gray-200)] pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[color:var(--gray-900)]">
            Your people
          </h1>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">
            The AI plays these real people and remembers what it learns after
            each session — so it gets more like them over time.
          </p>
        </div>
        <button onClick={onBack} className={GHOST_BTN}>
          Done
        </button>
      </div>

      {/* Add / edit form */}
      <section className="rounded-2xl border border-[color:var(--gray-200)] bg-[color:var(--gray-50)] p-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[color:var(--gray-500)]">
          {editing ? "Edit person" : "Add someone"}
        </h2>
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="person-name"
              name="person-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Name (e.g. Dana)"
              className={FIELD}
              aria-label="Name"
            />
            <input
              id="person-relationship"
              name="person-relationship"
              value={draft.relationship}
              onChange={(e) =>
                setDraft({ ...draft, relationship: e.target.value })
              }
              placeholder="Relationship (e.g. your manager)"
              className={FIELD}
              aria-label="Relationship"
            />
          </div>
          <textarea
            id="person-notes"
            name="person-notes"
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            rows={4}
            placeholder="What are they like? How do they react under pressure? What do they care about? (The app keeps adding to this as you practice.)"
            className={`${FIELD} resize-none`}
            aria-label="Notes"
          />
          <div className="flex items-center justify-end gap-2">
            {editing && (
              <button onClick={() => setDraft(EMPTY)} className={GHOST_BTN}>
                Cancel
              </button>
            )}
            <button
              onClick={submit}
              disabled={!draft.name.trim() || !draft.relationship.trim()}
              className={PRIMARY_BTN}
            >
              {editing ? "Save changes" : "Add person"}
            </button>
          </div>
        </div>
      </section>

      {/* List */}
      {people.length === 0 ? (
        <p className="text-sm text-muted">
          No people yet. Add someone above to practice a real conversation.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {people.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl border border-[color:var(--gray-200)] bg-white p-4 transition-colors hover:border-[color:var(--gray-400)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display text-base font-bold text-fg">
                    {p.name}
                  </div>
                  <div className="text-xs text-muted">{p.relationship}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {confirmingDeleteId === p.id ? (
                    <>
                      <button
                        onClick={() => {
                          onDelete(p.id);
                          setConfirmingDeleteId(null);
                        }}
                        className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                        title="Permanently deletes this person and everything the app has remembered about them"
                      >
                        Delete forever
                      </button>
                      <button
                        onClick={() => setConfirmingDeleteId(null)}
                        className={GHOST_BTN}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setConfirmingDeleteId(null);
                          startEdit(p);
                        }}
                        className={GHOST_BTN}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmingDeleteId(p.id)}
                        className="rounded-lg px-3 py-1.5 text-sm text-rose-500 transition-colors hover:bg-rose-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              {p.notes.trim() && (
                <p className="mt-3 whitespace-pre-wrap border-t border-[color:var(--gray-200)] pt-3 text-xs leading-relaxed text-muted">
                  {p.notes.trim()}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
