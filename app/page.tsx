"use client";

import { useEffect, useRef, useState } from "react";
import type {
  ChatMessage,
  Mode,
  Person,
  PremortemReport,
  Report,
  Scenario,
  Session,
} from "@/lib/types";
import { SCENARIOS } from "@/lib/scenarios";
import {
  deleteSession,
  getSession,
  listSessions,
  newId,
  saveSession,
} from "@/lib/store";
import {
  appendNotes,
  deletePerson,
  getPerson,
  listPeople,
  savePerson,
} from "@/lib/people";
import {
  FREE_DAILY_LIMIT,
  canStartSession,
  getUsage,
  recordSessionStart,
} from "@/lib/usage";
import ModeTabs from "@/components/ModeTabs";
import ScenarioPicker from "@/components/ScenarioPicker";
import PersonSelect from "@/components/PersonSelect";
import PeopleManager from "@/components/PeopleManager";
import ChatWindow from "@/components/ChatWindow";
import Composer from "@/components/Composer";
import ReportCard from "@/components/ReportCard";
import PremortemReportCard from "@/components/PremortemReportCard";
import UsageBadge from "@/components/UsageBadge";
import Logo from "@/components/Logo";
import Icon, { categoryIcon } from "@/components/Icon";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/landing/Marquee";
import HowItWorks from "@/components/landing/HowItWorks";
import TwoModes from "@/components/landing/TwoModes";
import MemoryFeature from "@/components/landing/MemoryFeature";
import SampleReport from "@/components/landing/SampleReport";
import Benefits from "@/components/landing/Benefits";
import UseCases from "@/components/landing/UseCases";
import Faq from "@/components/landing/Faq";
import FinalCta from "@/components/landing/FinalCta";
import SiteFooter from "@/components/landing/SiteFooter";

type View = "home" | "chat" | "report" | "people";

const PREMORTEM_PERSONA = "Interviewer";

const PRIMARY_BTN =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-[color:var(--gray-900)] text-white px-5 py-2.5 text-sm font-semibold tracking-tight transition-all hover:bg-[color:var(--gray-700)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--white)] disabled:cursor-not-allowed disabled:opacity-50";

const GHOST_BTN =
  "rounded-full px-3.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

const SECONDARY_BTN =
  "inline-flex items-center justify-center gap-1.5 rounded-full border border-[color:var(--gray-300)] bg-white px-5 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-[color:var(--gray-900)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50";

const FIELD_CLASS =
  "w-full rounded-xl border border-[color:var(--gray-300)] bg-white px-3.5 py-2.5 text-sm text-fg outline-none transition-colors placeholder:text-[color:var(--gray-400)] focus:border-[color:var(--gray-900)] disabled:opacity-50";

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

/**
 * POST to a streaming endpoint and invoke onDelta with the accumulated text as
 * it arrives. Returns the final full text. Throws with the server error on a
 * non-2xx (JSON) response.
 */
async function streamReply(
  url: string,
  body: unknown,
  onDelta: (full: string) => void,
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    const data = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    onDelta(full);
  }
  return full.trim();
}

/** The scenario driving a session — a user-authored one, or a built-in. */
function resolveScenario(s: Session): Scenario | undefined {
  return s.customScenario ?? SCENARIOS.find((x) => x.id === s.scenarioId);
}

/** Finished sessions (a graded report or risk map), newest first. */
function finishedSessions(): Session[] {
  return listSessions().filter((s) => s.report || s.premortemReport);
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
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [remembering, setRemembering] = useState(false);
  const [rememberedNotes, setRememberedNotes] = useState<string[] | null>(null);
  const [rememberError, setRememberError] = useState<string | null>(null);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [recent, setRecent] = useState<Session[]>([]);
  const [creatingCustom, setCreatingCustom] = useState(false);
  const [customSituation, setCustomSituation] = useState("");
  const [customPersona, setCustomPersona] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  const [buildingScenario, setBuildingScenario] = useState(false);

  // Mirror the current session in a ref so async handlers can tell, after an
  // await, whether the user has since navigated away / switched sessions.
  const sessionRef = useRef<Session | null>(null);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Read usage + saved people + finished sessions on mount only (localStorage is
  // unavailable during SSR/render, so these must not run during the render pass).
  useEffect(() => {
    setUsed(getUsage().sessionsStarted);
    setPeople(listPeople());
    setRecent(finishedSessions());
  }, []);

  const busy = awaitingReply || finishing;
  const atLimit = used >= FREE_DAILY_LIMIT;

  const scenario: Scenario | undefined = session
    ? resolveScenario(session)
    : undefined;

  // When a real person is attached, they — not the generic scenario persona —
  // drive every name the user sees (chat labels, header, composer, report).
  const activePerson: Person | undefined =
    session?.mode === "conversation" && session.personId
      ? people.find((p) => p.id === session.personId)
      : undefined;

  const personaName =
    session?.mode === "premortem"
      ? PREMORTEM_PERSONA
      : activePerson?.name ?? scenario?.personaName ?? "Them";

  const personaRoleLabel =
    activePerson?.relationship ?? scenario?.personaRole ?? "";

  function goHome() {
    setView("home");
    setSession(null);
    setError(null);
    setDecision("");
    setAwaitingReply(false);
    setFinishing(false);
    setRemembering(false);
    setRememberedNotes(null);
    setRememberError(null);
    setConfirmingLeave(false);
    setCreatingCustom(false);
    setCustomSituation("");
    setCustomPersona("");
    setCustomGoal("");
    setBuildingScenario(false);
    setUsed(getUsage().sessionsStarted);
    setPeople(listPeople());
    setRecent(finishedSessions());
  }

  // Leaving an in-progress chat throws away ungraded work, so confirm first.
  function requestLeave() {
    if (view === "chat" && hasUserTurn && !finishing) setConfirmingLeave(true);
    else goHome();
  }

  // Re-open a previously finished session's report from history.
  function openSession(id: string) {
    const s = getSession(id);
    if (!s) return;
    setError(null);
    setSession(s);
    // Historical reports don't re-run memory extraction; show a neutral panel.
    setRemembering(false);
    setRememberedNotes([]);
    setRememberError(null);
    setView("report");
  }

  function removeSession(id: string) {
    deleteSession(id);
    setRecent(finishedSessions());
  }

  // ---- Conversation flow ---------------------------------------------------

  function startConversation(s: Scenario, custom = false) {
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
      scenarioId: custom ? undefined : s.id,
      customScenario: custom ? s : undefined,
      personId: selectedPersonId ?? undefined,
      messages: [{ role: "assistant", content: s.openingLine, ts: now }],
      createdAt: now,
    };
    saveSession(sess);
    setSession(sess);
    setRememberedNotes(null);
    setRememberError(null);
    setCreatingCustom(false);
    setView("chat");
  }

  // Turn the user's free-text description into a full scenario, then start it.
  async function handleCreateCustom() {
    const situation = customSituation.trim();
    if (!situation) {
      setError("Describe the situation you want to practice.");
      return;
    }
    setError(null);
    if (!canStartSession()) {
      setUsed(getUsage().sessionsStarted);
      return;
    }
    setBuildingScenario(true);
    try {
      const { scenario } = await postJson<{ scenario: Scenario }>(
        "/api/scenario",
        {
          situation,
          persona: customPersona.trim() || undefined,
          goal: customGoal.trim() || undefined,
        },
      );
      startConversation(scenario, true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Couldn't build that scenario. Try again.",
      );
    } finally {
      setBuildingScenario(false);
    }
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
      // Consume the streamed opening question fully before entering the chat, so
      // a failed first call can't strand the user in an empty conversation.
      const reply = await streamReply(
        "/api/premortem",
        { messages: sess.messages, action: "reply", decision: d },
        () => {},
      );
      const aMsg: ChatMessage = {
        role: "assistant",
        content: reply || "…",
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
    const now = Date.now();
    const userMsg: ChatMessage = { role: "user", content: trimmed, ts: now };
    const base: Session = {
      ...session,
      messages: [...session.messages, userMsg],
    };
    const convoId = base.id;
    // Show the user's turn plus an empty assistant bubble that fills as it streams.
    setSession({
      ...base,
      messages: [...base.messages, { role: "assistant", content: "", ts: now + 1 }],
    });
    setAwaitingReply(true);
    try {
      let url: string;
      let body: unknown;
      if (base.mode === "conversation") {
        const sc = resolveScenario(base);
        if (!sc) throw new Error("Scenario not found.");
        const person = base.personId ? getPerson(base.personId) : undefined;
        url = "/api/roleplay";
        body = { scenario: sc, messages: base.messages, person };
      } else {
        url = "/api/premortem";
        body = {
          messages: base.messages,
          action: "reply",
          decision: base.decision,
        };
      }
      const full = await streamReply(url, body, (partial) => {
        // Live-update the trailing assistant bubble; bail if the user moved on.
        setSession((prev) => {
          if (!prev || prev.id !== convoId) return prev;
          const msgs = prev.messages.slice();
          msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: partial };
          return { ...prev, messages: msgs };
        });
      });
      if (sessionRef.current?.id !== convoId) return; // navigated away mid-stream
      const ended: Session = {
        ...base,
        messages: [
          ...base.messages,
          { role: "assistant", content: full || "…", ts: Date.now() },
        ],
      };
      setSession(ended);
      saveSession(ended);
    } catch (e) {
      // Roll the optimistic user turn + placeholder back out on failure.
      if (sessionRef.current?.id === convoId) {
        setSession(session);
        saveSession(session);
      }
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong — your message wasn't sent. Try again.",
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
        const sc = resolveScenario(session);
        if (!sc) throw new Error("Scenario not found.");
        const person = session.personId
          ? getPerson(session.personId)
          : undefined;
        const data = await postJson<{ report: Report }>("/api/analyze", {
          scenario: sc,
          messages: session.messages,
          person,
        });
        const ended: Session = {
          ...session,
          report: data.report,
          endedAt: Date.now(),
        };
        saveSession(ended); // persist the paid-for result even if they left
        if (sessionRef.current?.id !== session.id) return; // navigated away
        setSession(ended);
        setView("report");
        // Close the compounding loop automatically: learn about the real person.
        if (ended.personId) void handleRemember(ended);
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
        saveSession(ended);
        if (sessionRef.current?.id !== session.id) return; // navigated away
        setSession(ended);
        setView("report");
      }
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

  // After a conversation with a real person, extract durable notes about them
  // and fold them into that person's profile — the memory that compounds. Runs
  // automatically on finish; can also be retried from the report panel.
  async function handleRemember(target?: Session) {
    const sess = target ?? session;
    if (!sess || !sess.personId) return;
    const person = getPerson(sess.personId);
    if (!person) {
      setRememberError("That person is no longer saved, so there's nothing to update.");
      return;
    }
    setRemembering(true);
    setRememberError(null);
    try {
      const data = await postJson<{ notes: string[] }>("/api/remember", {
        person,
        messages: sess.messages,
      });
      const updated: Person = {
        ...person,
        notes: appendNotes(person.notes, data.notes),
        updatedAt: Date.now(),
      };
      savePerson(updated);
      setPeople(listPeople());
      setRememberedNotes(data.notes);
    } catch (e) {
      setRememberError(
        e instanceof Error ? e.message : "Couldn't save what you learned.",
      );
    } finally {
      setRemembering(false);
    }
  }

  const hasUserTurn =
    session?.mode === "conversation"
      ? session.messages.some((m) => m.role === "user")
      : (session?.messages.length ?? 0) >= 3;

  // Show the typing indicator only until the streamed reply's first token lands
  // (after that, the filling assistant bubble carries the "it's happening" signal).
  const lastMessage = session?.messages[session.messages.length - 1];
  const showTyping =
    awaitingReply &&
    (!lastMessage ||
      lastMessage.role !== "assistant" ||
      lastMessage.content.trim() === "");

  // ---- Render --------------------------------------------------------------

  return (
    <main className="flex min-h-[100dvh] w-full flex-col">
      <header className="sticky top-0 z-30 border-b border-border/70 glass">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3.5">
          <button
            onClick={requestLeave}
            className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Rehearse home"
          >
            <Logo />
          </button>
          <div className="flex items-center gap-6">
            {view === "home" && (
              <nav className="hidden items-center gap-6 sm:flex" aria-label="Site">
                <a href="#start" className="eyebrow wipe text-[color:var(--gray-600)] hover:text-[color:var(--gray-900)]">
                  Practice
                </a>
                <a href="#how" className="eyebrow wipe text-[color:var(--gray-600)] hover:text-[color:var(--gray-900)]">
                  How
                </a>
                <a href="#faq" className="eyebrow wipe text-[color:var(--gray-600)] hover:text-[color:var(--gray-900)]">
                  FAQ
                </a>
              </nav>
            )}
            {view !== "home" && (
              <button onClick={requestLeave} className={GHOST_BTN}>
                {view === "report" ? "New session" : "Exit"}
              </button>
            )}
            <a href="#start" className={PRIMARY_BTN}>
              Start
              <Icon name="arrowRight" size={15} strokeWidth={2.25} />
            </a>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------- HOME */}
      {view === "home" && (
        <>
          {/* Editorial hero — quiet tagline, then a massive bottom-anchored
              display title that rises from behind an overflow mask. */}
          <section className="edge flex min-h-[78vh] flex-col justify-between pb-2 pt-14 sm:min-h-[86vh]">
            <Reveal className="grid-12">
              <p className="rise col-span-12 sm:col-span-5">
                <span className="text-[15px] leading-relaxed text-[color:var(--gray-700)] sm:text-base">
                  The conversations that matter most are the ones we never
                  practice.
                </span>
              </p>
              <p className="rise col-span-12 mt-3 sm:col-span-5 sm:col-start-7 sm:mt-0">
                <span className="text-[15px] leading-relaxed text-[color:var(--gray-500)] sm:text-base">
                  Rehearse is a private stage — an AI plays the other person,
                  pushes back like they would, and shows you exactly what to
                  say better.
                </span>
              </p>
            </Reveal>
            <Reveal>
              <h1 className="rise block w-full">
                <span className="display block w-full text-center text-[15.5vw] uppercase leading-[0.92] tracking-[-0.03em] text-[color:var(--gray-900)] sm:text-[12.9vw]">
                  Rehearse
                </span>
              </h1>
              <div className="rise mt-4">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-[color:var(--gray-200)] pt-3">
                    <span className="eyebrow">Practice, privately</span>
                    <a
                      href="#start"
                      className="eyebrow wipe inline-flex items-center gap-1.5 text-[color:var(--gray-900)]"
                    >
                      Begin <Icon name="arrowRight" size={13} strokeWidth={2} />
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          <div
            id="start"
            className="mx-auto flex w-full max-w-2xl scroll-mt-24 flex-col gap-6 px-4 py-16"
          >
          <ModeTabs
            mode={mode}
            onChange={(m) => {
              setMode(m);
              setError(null);
              setCreatingCustom(false);
            }}
          />

          {mode === "conversation" ? (
            <section className="flex flex-col gap-4">
              <Reveal>
                <h2 className="rise">
                  <span className="display text-3xl text-[color:var(--gray-900)] sm:text-4xl">
                    Practice the <span className="marker">hard talk</span>
                  </span>
                </h2>
                <p className="rise mt-3">
                  <span className="max-w-sm text-[15px] text-muted">
                    An AI plays the other person — and pushes back.
                  </span>
                </p>
              </Reveal>

              <PersonSelect
                people={people}
                selectedId={selectedPersonId}
                onSelect={setSelectedPersonId}
                onManage={() => setView("people")}
                disabled={atLimit}
              />

              <div className="flex items-center justify-between border-t border-[color:var(--gray-200)] pt-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted">
                  Choose a scenario
                </h2>
                <UsageBadge used={used} limit={FREE_DAILY_LIMIT} />
              </div>

              {atLimit && <LimitCallout used={used} />}

              {error && (
                <p className="text-sm font-medium text-rose-500">
                  {error}
                </p>
              )}

              <ScenarioPicker
                scenarios={SCENARIOS}
                onPick={startConversation}
                disabled={atLimit}
              />

              {!creatingCustom ? (
                <button
                  type="button"
                  onClick={() => {
                    setCreatingCustom(true);
                    setError(null);
                  }}
                  disabled={atLimit}
                  className="group flex items-center justify-between gap-4 border-t border-[color:var(--gray-200)] pt-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>
                    <span className="block font-display text-lg tracking-tight text-[color:var(--gray-900)]">
                      Not listed? Describe your own
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">
                      Any situation, in one sentence.
                    </span>
                  </span>
                  <span className="wipe inline-flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[color:var(--gray-900)]">
                    Write it
                    <Icon
                      name="arrowRight"
                      size={13}
                      strokeWidth={2}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </button>
              ) : (
                <div className="animate-scale-in rounded-3xl border border-border bg-surface p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-bold">
                      Describe your own conversation
                    </h3>
                    <button
                      onClick={() => setCreatingCustom(false)}
                      className={GHOST_BTN}
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="mt-3 flex flex-col gap-3">
                    <textarea
                      value={customSituation}
                      onChange={(e) => setCustomSituation(e.target.value)}
                      rows={3}
                      placeholder="What's the conversation? e.g. Tell my landlord I'm withholding rent until the heating is fixed"
                      className={`${FIELD_CLASS} resize-none`}
                      aria-label="Situation"
                    />
                    <input
                      value={customPersona}
                      onChange={(e) => setCustomPersona(e.target.value)}
                      placeholder="Who are you talking to? (optional)"
                      className={FIELD_CLASS}
                      aria-label="Who you're talking to"
                    />
                    <input
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      placeholder="What do you want out of it? (optional)"
                      className={FIELD_CLASS}
                      aria-label="Your goal"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleCreateCustom}
                        disabled={
                          atLimit || !customSituation.trim() || buildingScenario
                        }
                        className={PRIMARY_BTN}
                      >
                        {buildingScenario ? "Building…" : "Create & start →"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          ) : (
            <section className="flex animate-fade-up flex-col gap-4">
              <Reveal>
                <h2 className="rise">
                  <span className="display text-3xl text-[color:var(--gray-900)] sm:text-4xl">
                    Pre-mortem a <span className="marker">decision</span>
                  </span>
                </h2>
                <p className="rise mt-3">
                  <span className="max-w-sm text-[15px] text-muted">
                    Imagine it already failed. Find out why — before you commit.
                  </span>
                </p>
              </Reveal>

              <div className="flex items-center justify-between border-t border-[color:var(--gray-200)] pt-4">
                <label
                  htmlFor="decision-input"
                  className="text-xs font-bold uppercase tracking-widest text-muted"
                >
                  Your decision
                </label>
                <UsageBadge used={used} limit={FREE_DAILY_LIMIT} />
              </div>

              {atLimit && <LimitCallout used={used} />}

              <textarea
                id="decision-input"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                disabled={atLimit}
                rows={3}
                placeholder="e.g. Leave my stable job to start a company with a friend"
                className="w-full resize-none rounded-xl border border-[color:var(--gray-300)] bg-white px-4 py-3 text-[15px] text-fg outline-none transition-colors placeholder:text-[color:var(--gray-400)] focus:border-[color:var(--gray-900)] disabled:opacity-50"
              />

              {error && (
                <p className="text-sm font-medium text-rose-500">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-muted">
                  Name the decision you can&apos;t unmake.
                </span>
                <button
                  onClick={startPremortem}
                  disabled={atLimit || !decision.trim() || busy}
                  className={PRIMARY_BTN}
                >
                  {awaitingReply ? "Starting…" : "Start the pre-mortem"}
                  <Icon name="arrowRight" size={15} strokeWidth={2} />
                </button>
              </div>
            </section>
          )}

          <RecentSessions
            sessions={recent}
            onOpen={openSession}
            onDelete={removeSession}
          />
          </div>

          <Marquee />
          <HowItWorks />
          <TwoModes />
          <MemoryFeature />
          <SampleReport />
          <Benefits />
          <UseCases />
          <Faq />
          <FinalCta />
          <SiteFooter />
        </>
      )}

      {/* ---------------------------------------------------------------- CHAT */}
      {view === "chat" && session && (
        <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-4 py-4">
          {session.mode === "conversation" && scenario ? (
            <div className="mb-4 animate-fade-up border-b border-[color:var(--gray-200)] pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[color:var(--gray-200)] text-[color:var(--gray-900)]">
                  <Icon name={categoryIcon(scenario.category)} size={17} />
                </span>
                <div className="min-w-0">
                  <div className="truncate font-display text-base tracking-tight text-[color:var(--gray-900)]">
                    {scenario.title}
                  </div>
                  <div className="truncate text-xs text-muted">
                    {personaName} · {personaRoleLabel}
                    {activePerson && (
                      <span className="ml-1 font-semibold text-[color:var(--gray-900)]">
                        · from memory
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-2.5 text-xs leading-relaxed">
                <span className="font-bold uppercase tracking-[0.12em] text-[color:var(--gray-500)]">
                  Your goal
                </span>{" "}
                <span className="text-[color:var(--gray-700)]">
                  {scenario.userGoal}
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-4 animate-fade-up border-b border-[color:var(--gray-200)] pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[color:var(--gray-200)] text-[color:var(--gray-900)]">
                  <Icon name="target" size={17} />
                </span>
                <div className="min-w-0">
                  <div className="font-display text-base tracking-tight text-[color:var(--gray-900)]">
                    Pre-mortem
                  </div>
                  <p className="line-clamp-2 text-xs text-muted">
                    {session.decision}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-hidden">
            <ChatWindow
              messages={session.messages}
              personaName={personaName}
              loading={showTyping}
            />
          </div>

          <div className="pt-3">
            {finishing ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <span className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-accent" />
                <p className="text-sm text-muted">
                  {session.mode === "conversation"
                    ? "Grading your rehearsal…"
                    : "Building your risk map…"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {error && (
                  <p className="text-sm font-medium text-rose-500">
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
                  <span className="text-xs text-muted">
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
        <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-12">
          {session.mode === "conversation" && session.report ? (
            <div className="flex flex-col gap-4">
              <ReportCard report={session.report} onRestart={goHome} />
              {session.personId && (
                <RememberPanel
                  name={
                    people.find((p) => p.id === session.personId)?.name ?? "them"
                  }
                  loading={remembering}
                  notes={rememberedNotes}
                  error={rememberError}
                  onRemember={() => handleRemember()}
                />
              )}
              <ShareBar session={session} scenario={scenario} />
            </div>
          ) : session.mode === "premortem" && session.premortemReport ? (
            <div className="flex flex-col gap-4">
              <PremortemReportCard
                report={session.premortemReport}
                onRestart={goHome}
              />
              <ShareBar session={session} />
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-surface p-6 text-center shadow-card">
              <p className="text-sm text-muted">
                This report isn&apos;t available.
              </p>
              <button onClick={goHome} className={`${PRIMARY_BTN} mt-4`}>
                Start over
              </button>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------- PEOPLE */}
      {view === "people" && (
        <div className="mx-auto w-full max-w-2xl px-4">
          <PeopleManager
            people={people}
            onSave={(p) => {
              savePerson(p);
              setPeople(listPeople());
            }}
            onDelete={(id) => {
              deletePerson(id);
              setPeople(listPeople());
              if (selectedPersonId === id) setSelectedPersonId(null);
            }}
            onBack={() => setView("home")}
          />
        </div>
      )}

      {confirmingLeave && (
        <div
          className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Leave this rehearsal?"
        >
          <div className="w-full max-w-sm animate-scale-in rounded-3xl border border-border bg-surface p-5 shadow-glow">
            <h2 className="font-display text-lg font-bold text-fg">
              Leave this rehearsal?
            </h2>
            <p className="mt-1 text-sm text-muted">
              You haven&apos;t ended it, so it won&apos;t be graded — and an
              unfinished rehearsal can&apos;t be resumed.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmingLeave(false)}
                className={SECONDARY_BTN}
              >
                Stay
              </button>
              <button
                onClick={() => {
                  setConfirmingLeave(false);
                  goHome();
                }}
                className={PRIMARY_BTN}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function RecentSessions({
  sessions,
  onOpen,
  onDelete,
}: {
  sessions: Session[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (sessions.length === 0) return null;
  return (
    <section className="flex flex-col gap-3 border-t border-border/70 pt-6">
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted">
        Recent sessions
      </h2>
      <ul className="flex flex-col gap-2">
        {sessions.slice(0, 6).map((s) => {
          const conv = s.mode === "conversation";
          const sc = conv
            ? s.customScenario ?? SCENARIOS.find((x) => x.id === s.scenarioId)
            : undefined;
          const title = conv ? sc?.title ?? "Conversation" : "Pre-mortem";
          const iconName = conv ? categoryIcon(sc?.category ?? "") : "target";
          const subtitle = conv ? undefined : s.decision;
          const badge = conv
            ? s.report
              ? `${Math.round(s.report.overallScore)}/100`
              : null
            : s.premortemReport
              ? `${s.premortemReport.overallRisk} risk`
              : null;
          return (
            <li
              key={s.id}
              className="flex items-center gap-2 rounded-2xl border border-[color:var(--gray-200)] bg-white p-3 transition-colors hover:border-[color:var(--gray-400)]"
            >
              <button
                onClick={() => onOpen(s.id)}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[color:var(--gray-200)] text-[color:var(--gray-600)]">
                  <Icon name={iconName} size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[color:var(--gray-900)]">
                    {title}
                  </span>
                  {subtitle && (
                    <span className="block truncate text-xs text-muted">
                      {subtitle}
                    </span>
                  )}
                </span>
              </button>
              {badge && (
                <span className="shrink-0 rounded-full border border-[color:var(--gray-200)] px-2.5 py-0.5 text-xs font-semibold capitalize text-muted">
                  {badge}
                </span>
              )}
              <button
                onClick={() => onDelete(s.id)}
                aria-label={`Delete ${title} session`}
                className="shrink-0 rounded-lg px-2 py-1 text-sm text-muted transition-colors hover:bg-rose-500/10 hover:text-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ShareBar({
  session,
  scenario,
}: {
  session: Session;
  scenario?: Scenario;
}) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // Detect native share after mount to avoid an SSR/client hydration mismatch.
  useEffect(() => {
    setCanShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, []);

  const conv = session.mode === "conversation";
  const summary =
    conv && session.report
      ? `I scored ${Math.round(session.report.overallScore)}/100 rehearsing "${
          scenario?.title ?? "a hard conversation"
        }" on Rehearse.\n\n"${session.report.headline}"\n\nPractice the conversations that scare you.`
      : session.premortemReport
        ? `Pre-mortem risk map: ${session.premortemReport.overallRisk.toUpperCase()} risk for "${session.premortemReport.decision}".\n\nPractice the decisions that scare you — on Rehearse.`
        : "";

  const ogUrl =
    conv && session.report
      ? `/api/og?type=conversation&score=${Math.round(
          session.report.overallScore,
        )}&title=${encodeURIComponent(
          scenario?.title ?? "",
        )}&headline=${encodeURIComponent(session.report.headline)}`
      : session.premortemReport
        ? `/api/og?type=premortem&risk=${encodeURIComponent(
            session.premortemReport.overallRisk,
          )}&decision=${encodeURIComponent(session.premortemReport.decision)}`
        : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable / blocked — non-fatal
    }
  }

  async function share() {
    try {
      await navigator.share({ title: "Rehearse", text: summary });
    } catch {
      // share cancelled or failed — fall back to copy
      copy();
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button onClick={copy} className={SECONDARY_BTN}>
        <Icon name={copied ? "check" : "copy"} size={16} className="mr-1.5" />
        {copied ? "Copied" : "Copy"}
      </button>
      <a href={ogUrl} target="_blank" rel="noreferrer" className={SECONDARY_BTN}>
        <Icon name="image" size={16} className="mr-1.5" /> Image
      </a>
      {canShare && (
        <button onClick={share} className={SECONDARY_BTN}>
          <Icon name="share" size={16} className="mr-1.5" /> Share
        </button>
      )}
    </div>
  );
}

function LimitCallout({ used }: { used: number }) {
  return (
    <div className="animate-scale-in rounded-3xl border border-amber-400/30 bg-amber-500/10 p-5">
      <div className="font-display text-sm font-bold text-amber-600 dark:text-amber-300">
        You&apos;ve hit today&apos;s free limit
      </div>
      <p className="mt-1 text-sm text-amber-700/90 dark:text-amber-200/70">
        You&apos;ve used all {FREE_DAILY_LIMIT} free rehearsals for today. Come
        back tomorrow to keep practicing.
      </p>
      <div className="mt-3">
        <UsageBadge used={used} limit={FREE_DAILY_LIMIT} />
      </div>
    </div>
  );
}

function RememberPanel({
  name,
  loading,
  notes,
  error,
  onRemember,
}: {
  name: string;
  loading: boolean;
  notes: string[] | null;
  error: string | null;
  onRemember: () => void;
}) {
  const isLoading = loading || (notes === null && !error);
  return (
    <div className="animate-scale-in rounded-2xl border border-[color:var(--gray-200)] bg-[color:var(--gray-50)] p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[color:var(--gray-500)]">
        <Icon name="spark" size={14} /> Remembering {name}
      </div>
      {isLoading ? (
        <div className="mt-2.5 flex items-center gap-2 text-sm text-[color:var(--gray-700)]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[color:var(--gray-300)] border-t-[color:var(--gray-900)]" />
          Saving what the AI just learned about {name}…
        </div>
      ) : error ? (
        <>
          <p className="mt-1.5 text-sm font-medium text-rose-500">{error}</p>
          <button onClick={onRemember} className={`${PRIMARY_BTN} mt-3`}>
            Try again
          </button>
        </>
      ) : notes && notes.length === 0 ? (
        <p className="mt-1.5 text-sm text-[color:var(--gray-700)]">
          Nothing new to add about {name} this time — their profile is already
          up to date.
        </p>
      ) : (
        <div className="mt-2">
          <p className="text-sm text-[color:var(--gray-700)]">
            Added to {name}&apos;s profile:
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {(notes ?? []).map((n, i) => (
              <li
                key={i}
                className="rounded-xl border border-[color:var(--gray-200)] bg-white px-3 py-1.5 text-sm text-[color:var(--gray-800)]"
              >
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
