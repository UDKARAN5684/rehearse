"use client";
// Client-side persistence for practice sessions. localStorage only — no
// accounts in the MVP. Every accessor is SSR-safe (guards on window).
import type { Session } from "./types";

const KEY = "rehearse.sessions.v1";

function read(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch {
    return [];
  }
}

function write(sessions: Session[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(sessions));
  } catch {
    // storage full or disabled — non-fatal for the MVP
  }
}

export function listSessions(): Session[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function getSession(id: string): Session | undefined {
  return read().find((s) => s.id === id);
}

export function saveSession(session: Session): void {
  const all = read();
  const idx = all.findIndex((s) => s.id === session.id);
  if (idx >= 0) all[idx] = session;
  else all.push(session);
  write(all);
}

export function deleteSession(id: string): void {
  write(read().filter((s) => s.id !== id));
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "s_" + Date.now().toString(36);
}
