// Shared domain types for Rehearse. This is the single source of truth —
// every other module imports from here and must not redefine these shapes.

export type Role = "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
  ts: number;
}

export type Difficulty = "easy" | "realistic" | "hard";

export interface Scenario {
  id: string;
  emoji: string;
  title: string; // e.g. "Ask for a raise"
  category: string; // e.g. "Work"
  blurb: string; // one-line description shown on the card
  personaName: string; // e.g. "Dana"
  personaRole: string; // e.g. "your manager"
  personaBrief: string; // hidden context that shapes the AI's behaviour
  difficulty: Difficulty;
  openingLine: string; // the AI (persona) speaks first
  userGoal: string; // what the user is trying to achieve (shown to user)
}

export interface HurtYou {
  quote: string; // the user's exact words
  why: string; // why it landed badly
  tryInstead: string; // a concrete better line
}

export interface Report {
  overallScore: number; // 0-100
  headline: string; // one-line summary of how it went
  wentWell: string[];
  hurtYou: HurtYou[];
  missedMoves: string[]; // tactics a skilled communicator would have used
  oneThingNextTime: string; // the single highest-leverage change
}

export type RiskLevel = "low" | "medium" | "high";

export interface PremortemRisk {
  dimension: string; // "Financial", "Emotional", ...
  failure: string; // what goes wrong
  likelihood: RiskLevel;
  inoculation: string; // a small action to take now
}

export interface PremortemReport {
  decision: string;
  overallRisk: RiskLevel;
  storyOfFailure: string; // the narrative
  risks: PremortemRisk[];
  topInoculations: string[];
}

export type Mode = "conversation" | "premortem";

// A real person in the user's life. Attaching one to a conversation makes the
// AI role-play *them* using `notes`, which grows over time as the app extracts
// durable observations after each session. This is the compounding moat.
export interface Person {
  id: string;
  name: string; // "Dana"
  relationship: string; // "your manager", "your mom"
  notes: string; // freeform memory of who they are; appended to over time
  createdAt: number;
  updatedAt: number;
}

export interface Session {
  id: string;
  mode: Mode;
  scenarioId?: string;
  customScenario?: Scenario; // a user-authored scenario (not in the built-in list)
  personId?: string; // the real person this conversation was played as, if any
  decision?: string; // for premortem sessions
  messages: ChatMessage[];
  report?: Report;
  premortemReport?: PremortemReport;
  createdAt: number;
  endedAt?: number;
}

export interface UsageState {
  date: string; // YYYY-MM-DD
  sessionsStarted: number;
}
