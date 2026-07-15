import { MODELS, completeJson } from "@/lib/claude";
import { analysisSystem, transcriptToText } from "@/lib/prompts";
import type { ChatMessage, Report, Scenario } from "@/lib/types";

export const runtime = "nodejs";

interface AnalyzeBody {
  scenario: Scenario;
  messages: ChatMessage[];
}

function isScenario(value: unknown): value is Scenario {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  return typeof s.id === "string" && typeof s.personaName === "string";
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

  const { scenario, messages } = (body ?? {}) as Partial<AnalyzeBody>;

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
    const system = analysisSystem(scenario);
    const user = transcriptToText(messages, scenario.personaName);
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
