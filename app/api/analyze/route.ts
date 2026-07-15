import { MODELS, completeJson } from "@/lib/claude";
import { analysisSystem, transcriptToText } from "@/lib/prompts";
import type { ChatMessage, Person, Report, Scenario } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60; // LLM calls can exceed the 10s serverless default

interface AnalyzeBody {
  scenario: Scenario;
  messages: ChatMessage[];
  person?: Person;
}

function isScenario(value: unknown): value is Scenario {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  return typeof s.id === "string" && typeof s.personaName === "string";
}

function isPerson(value: unknown): value is Person {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;
  return typeof p.name === "string" && typeof p.relationship === "string";
}

function isChatMessages(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.every(
      (m) =>
        typeof m === "object" &&
        m !== null &&
        (((m as ChatMessage).role === "user") ||
          (m as ChatMessage).role === "assistant") &&
        typeof (m as ChatMessage).content === "string",
    )
  );
}

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { scenario, messages, person } = (body ?? {}) as Partial<AnalyzeBody>;

  if (!isScenario(scenario)) {
    return Response.json(
      { error: "A valid `scenario` is required." },
      { status: 400 },
    );
  }
  if (!isChatMessages(messages) || messages.length === 0) {
    return Response.json(
      { error: "`messages` must be a non-empty array of chat messages." },
      { status: 400 },
    );
  }

  try {
    const activePerson = isPerson(person) ? person : undefined;
    const system = analysisSystem(scenario, activePerson);
    const user = transcriptToText(
      messages,
      activePerson ? activePerson.name : scenario.personaName,
    );
    const report = await completeJson<Report>({
      model: MODELS.analysis,
      system,
      user,
      maxTokens: 2048,
    });
    return Response.json({ report });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate the report.";
    return Response.json({ error: message }, { status: 500 });
  }
}
