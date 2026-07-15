"use client";
// Free-tier daily cap. Doubles as the future paywall boundary and as a guard on
// LLM spend. Resets each calendar day. Client-side only for the MVP.
import type { UsageState } from "./types";

const KEY = "rehearse.usage.v1";
export const FREE_DAILY_LIMIT = 3;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getUsage(): UsageState {
  const fresh: UsageState = { date: today(), sessionsStarted: 0 };
  if (typeof window === "undefined") return fresh;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as UsageState) : null;
    if (!parsed || parsed.date !== today()) return fresh;
    return parsed;
  } catch {
    return fresh;
  }
}

export function canStartSession(): boolean {
  return getUsage().sessionsStarted < FREE_DAILY_LIMIT;
}

export function recordSessionStart(): UsageState {
  const current = getUsage();
  const next: UsageState = {
    date: current.date,
    sessionsStarted: current.sessionsStarted + 1,
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // non-fatal
    }
  }
  return next;
}
