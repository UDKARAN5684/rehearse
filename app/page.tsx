"use client";

import { useEffect, useState } from "react";
import type {
  ChatMessage,
  Mode,
  PremortemReport,
  Report,
  Scenario,
  Session,
} from "@/lib/types";
import { SCENARIOS } from "@/lib/scenarios";
import { newId, saveSession } from "@/lib/store";
import {
  FREE_DAILY_LIMIT,
  canStartSession,
  getUsage,
  recordSessionStart,
} from "@/lib/usage";
import ModeTabs from "@/components/ModeTabs";
import ScenarioPicker from "@/components/ScenarioPicker";
import ChatWindow from "@/components/ChatWindow";
import Composer from "@/components/Composer";
import ReportCard from "@/components/ReportCard";
import PremortemReportCard from "@/components/PremortemReportCard";
import UsageBadge from "@/components/UsageBadge";

type View = "home" | "chat" | "report";

const PREMORTEM_PERSONA = "Interviewer";

const PRIMARY_BTN =
  "inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50";

const GHOST_BTN =
  "rounded-lg px-3 py-1.5 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100";

const SECONDARY_BTN =
  "inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-transparent px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800";

/** POST JSON and surface a useful error message on any non-2xx / bad body. */
async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as
    | (Partial<T> & { error?: string })
    | null;
  if (!res.ok || !data) {
    const msg =
      data && typeof data.error === "string"
        ? data.error
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export default function Page() {
  const [view, setView] = useState<View>("home");
  const [mode, setMode] = useState<Mode>("conversation");
  const [session, setSession] = useState<Session | null>(null);
  const [decision, setDecision] = useState("");
  const [awaitingReply, setAwaitingReply] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [used, setUsed] = useState(0);

  // Read usage on mount only (localStorage is not available during SSR/render).
  useEffect(() => {
    setUsed(getUsage().sessionsStarted);
  }, []);

  const busy = awaitingReply || finishing;
  const atLimit = used >= FREE_DAILY_LIMIT;

  const scenario: Scenario | undefined = session?.scenarioId
    ? SCENARIOS.find((s: Scenario) => s.id === session.scenarioId)
    : undefined;

  const personaName =
    session?.mode === "premortem"
      ? PREMORTEM_PERSONA
      : scenario?.personaName ?? "Them";

  function goHome() {
    setView("home");
    setSession(null);
    setError(null);
    setDecision("");
    setAwaitingReply(false);
    setFinishing(false);
    setUsed(getUsage().sessionsStarted);
  }

  // ---- Conversation flow ---------------------------------------------------

  function startConversation(s: Scenario) {
    setError(null);
    if (!canStartSession()) {
      setUsed(getUsage().sessionsStarted);
      return;
    }
    recordSessionStart();
    setUsed(getUsage().sessionsStarted);
    const now = Date.now();
    const sess: Session = {
      id: newId(),
      mode: "conversation",
      scenarioId: s.id,
      messages: [{ role: "assistant", content: s.openingLine, ts: now }],
      createdAt: now,
    };
    saveSession(sess);
    setSession(sess);
    setView("chat");
  }

  // ---- Pre-mortem flow -----------------------------------------------------

  async function startPremortem() {
    const d = decision.trim();
    if (!d) {
      setError("Describe the decision you want to pressure-test.");
      return;
    }
    setError(null);
    if (!canStartSession()) {
      setUsed(getUsage().sessionsStarted);
      return;
    }
    const now = Date.now();
    const sess: Session = {
      id: newId(),
      mode: "premortem",
      decision: d,
      messages: [{ role: "user", content: "My decision: " + d, ts: now }],
      createdAt: now,
    };
    // Don't consume a session or leave the home screen until the interviewer's
    // opening question actually arrives — otherwise a failed first call strands
    // the user in an empty chat with a session already burned.
    setAwaitingReply(true);
    try {
      const data = await postJson<{ reply: string }>("/api/premortem", {
        messages: sess.messages,
        action: "reply",
        decision: d,
      });
      const aMsg: ChatMessage = {
        role: "assistant",
        content: data.reply,
        ts: Date.now(),
      };
      const withReply: Session = {
        ...sess,
        messages: [...sess.messages, aMsg],
      };
      recordSessionStart();
      setUsed(getUsage().sessionsStarted);
      saveSession(withReply);
      setSession(withReply);
      setView("chat");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Couldn't start the pre-mortem. Try again.",
      );
    } finally {
      setAwaitingReply(false);
    }
  }

  // ---- Shared chat loop ----------------------------------------------------

  async function handleSend(text: string) {
    if (!session || busy) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    setError(null);
    const userMsg: ChatMessage = {
      role: "user",
      content: trimmed,
      ts: Date.now(),
    };
    const withUser: Session = {
      ...session,
      messages: [...session.messages, userMsg],
    };
    setSession(withUser);
    saveSession(withUser);
    setAwaitingReply(true);
    try {
      let reply: string;
      if (withUser.mode === "conversation") {
        const sc = SCENARIOS.find((s: Scenario) => s.id === withUser.scenarioId);
        if (!sc) throw new Error("Scenario not found.");
        const data = await postJson<{ reply: string }>("/api/roleplay", {
          scenario: sc,
          messages: withUser.messages,
        });
        reply = data.reply;
      } else {
        const data = await postJson<{ reply: string }>("/api/premortem", {
          messages: withUser.messages,
          action: "reply",
          decision: withUser.decision,
        });
        reply = data.reply;
      }
      const aMsg: ChatMessage = {
        role: "assistant",
        content: reply,
        ts: Date.now(),
      };
      const withReply: Session = {
        ...withUser,
        messages: [...withUser.messages, aMsg],
      };
      setSession(withReply);
      saveSession(withReply);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Try again.",
      );
    } finally {
      setAwaitingReply(false);
    }
  }

  async function handleFinish() {
    if (!session || busy) return;
    setError(null);
    setFinishing(true);
    try {
      if (session.mode === "conversation") {
        const sc = SCENARIOS.find((s: Scenario) => s.id === session.scenarioId);
        if (!sc) throw new Error("Scenario not found.");
        const data = await postJson<{ report: Report }>("/api/analyze", {
          scenario: sc,
          messages: session.messages,
        });
        const ended: Session = {
          ...session,
          report: data.report,
          endedAt: Date.now(),
        };
        setSession(ended);
        saveSession(ended);
      } else {
        const data = await postJson<{ report: PremortemReport }>(
          "/api/premortem",
          {
            messages: session.messages,
            action: "report",
            decision: session.decision,
          },
        );
        const ended: Session = {
          ...session,
          premortemReport: data.report,
          endedAt: Date.now(),
        };
        setSession(ended);
        saveSession(ended);
      }
      setView("report");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Couldn't generate your report. Try again.",
      );
    } finally {
      setFinishing(false);
    }
  }

  const hasUserTurn =
    session?.mode === "conversation"
      ? session.messages.some((m) => m.role === "user")
      : (session?.messages.length ?? 0) >= 3;

  // ---- Render --------------------------------------------------------------

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col px-4">
      <header className="flex items-center justify-between border-b border-neutral-200/70 py-4 dark:border-neutral-800/70">
        <button
          onClick={goHome}
          className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg"
          aria-label="Rehearse home"
        >
          <span className="text-xl" aria-hidden>
            🎭
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-tight">
              Rehearse
            </span>
            <span className="block text-xs text-neutral-500 dark:text-neutral-400">
              Practice the conversations that scare you
            </span>
          </span>
        </button>
        {view !== "home" && (
          <button onClick={goHome} className={GHOST_BTN}>
            {view === "report" ? "New session" : "Exit"}
          </button>
        )}
      </header>

      {/* ---------------------------------------------------------------- HOME */}
      {view === "home" && (
        <div className="flex flex-1 flex-col gap-6 py-6 pb-12">
          <ModeTabs
            mode={mode}
            onChange={(m) => {
              setMode(m);
              setError(null);
            }}
          />

          {mode === "conversation" ? (
            <section className="flex flex-col gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Rehearse a hard conversation
                </h1>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Pick a scenario. An AI plays the other person — and pushes
                  back like they would. Practice, then get a candid report
                  card.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  Choose a scenario
                </h2>
                <UsageBadge used={used} limit={FREE_DAILY_LIMIT} />
              </div>

              {atLimit && <LimitCallout used={used} />}

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <ScenarioPicker
                scenarios={SCENARIOS}
                onPick={startConversation}
                disabled={atLimit}
              />
            </section>
          ) : (
            <section className="flex flex-col gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Pre-mortem a big decision
                </h1>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  State a decision you&apos;re weighing. We&apos;ll fast-forward
                  two years, imagine it failed spectacularly, and interview you
                  one dimension at a time to surface the real risks.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  Your decision
                </h2>
                <UsageBadge used={used} limit={FREE_DAILY_LIMIT} />
              </div>

              {atLimit && <LimitCallout used={used} />}

              <textarea
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                disabled={atLimit}
                rows={4}
                placeholder="e.g. Leave my stable job to start a company with a friend"
                className="w-full resize-none rounded-2xl border border-neutral-200 bg-white p-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:placeholder:text-neutral-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
              />

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end">
                <button
                  onClick={startPremortem}
                  disabled={atLimit || !decision.trim() || busy}
                  className={PRIMARY_BTN}
                >
                  {awaitingReply ? "Starting…" : "Start the pre-mortem →"}
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------- CHAT */}
      {view === "chat" && session && (
        <div className="flex min-h-0 flex-1 flex-col py-4">
          {session.mode === "conversation" && scenario ? (
            <div className="mb-3 rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden>
                  {scenario.emoji}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {scenario.title}
                  </div>
                  <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {scenario.personaName} · {scenario.personaRole}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-medium text-neutral-600 dark:text-neutral-300">
                  Your goal:
                </span>{" "}
                {scenario.userGoal}
              </div>
            </div>
          ) : (
            <div className="mb-3 rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="text-lg" aria-hidden>
                  🔮
                </span>
                Pre-mortem
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                {session.decision}
              </p>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-hidden">
            <ChatWindow
              messages={session.messages}
              personaName={personaName}
              loading={awaitingReply}
            />
          </div>

          <div className="pt-3">
            {finishing ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-indigo-600 dark:border-neutral-700 dark:border-t-indigo-400" />
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {session.mode === "conversation"
                    ? "Grading your rehearsal…"
                    : "Building your risk map…"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
                <Composer
                  onSend={handleSend}
                  disabled={busy}
                  placeholder={
                    session.mode === "conversation"
                      ? `Reply to ${personaName}…`
                      : "Answer honestly…"
                  }
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {session.mode === "conversation"
                      ? "Talk like you would in real life."
                      : "The failures you name become your risk map."}
                  </span>
                  <button
                    onClick={handleFinish}
                    disabled={busy || !hasUserTurn}
                    className={SECONDARY_BTN}
                  >
                    {session.mode === "conversation"
                      ? "End & analyze"
                      : "Finish · risk map"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------- REPORT */}
      {view === "report" && session && (
        <div className="flex-1 py-6 pb-12">
          {session.mode === "conversation" && session.report ? (
            <ReportCard report={session.report} onRestart={goHome} />
          ) : session.mode === "premortem" && session.premortemReport ? (
            <PremortemReportCard
              report={session.premortemReport}
              onRestart={goHome}
            />
          ) : (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                This report isn&apos;t available.
              </p>
              <button onClick={goHome} className={`${PRIMARY_BTN} mt-4`}>
                Start over
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function LimitCallout({ used }: { used: number }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/30">
      <div className="text-sm font-medium text-amber-900 dark:text-amber-200">
        You&apos;ve hit today&apos;s free limit
      </div>
      <p className="mt-1 text-sm text-amber-800/80 dark:text-amber-200/70">
        You&apos;ve used all {FREE_DAILY_LIMIT} free rehearsals for today. Come
        back tomorrow to keep practicing.
      </p>
      <div className="mt-3">
        <UsageBadge used={used} limit={FREE_DAILY_LIMIT} />
      </div>
    </div>
  );
}
