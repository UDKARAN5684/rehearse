"use client";
// Client-side persistence for the real people the user practices with.
// localStorage only (like sessions); every accessor is SSR-safe.
import type { Person } from "./types";

const KEY = "rehearse.people.v1";

function read(): Person[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Person[]) : [];
  } catch {
    return [];
  }
}

function write(people: Person[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(people));
  } catch {
    // storage full or disabled — non-fatal for the MVP
  }
}

export function listPeople(): Person[] {
  return read().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getPerson(id: string): Person | undefined {
  return read().find((p) => p.id === id);
}

export function savePerson(person: Person): void {
  const all = read();
  const idx = all.findIndex((p) => p.id === person.id);
  if (idx >= 0) all[idx] = person;
  else all.push(person);
  write(all);
}

export function deletePerson(id: string): void {
  write(read().filter((p) => p.id !== id));
}

/** Merge freshly-extracted memory notes into a person's freeform notes. */
export function appendNotes(existing: string, additions: string[]): string {
  const clean = additions.map((n) => n.trim()).filter(Boolean);
  if (clean.length === 0) return existing;
  const bullets = clean.map((n) => (n.startsWith("- ") ? n : `- ${n}`));
  const base = existing.trim();
  return base ? `${base}\n${bullets.join("\n")}` : bullets.join("\n");
}
