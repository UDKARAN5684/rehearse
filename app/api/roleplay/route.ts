import { MODELS, complete } from "@/lib/claude";
import { roleplaySystem } from "@/lib/prompts";
import type { ChatMessage, Scenario } from "@/lib/types";

export const runtime = "nodejs";

interface RoleplayBody {
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

  const { scenario, messages } = (body ?? {}) as Partial<RoleplayBody>;

  if (!isScenario(scenario)) {
    return Response.json(
      { error: "A valid `scenario` is required." },
      { status: 400 },
    );
  }
  if (!isChatMessages(messages)) {
    return Response.json(
      { error: "`messages` must be an array of chat messages." },
      { status: 400 },
    );
  }

  try {
    const system = roleplaySystem(scenario);
    const reply = await complete({
      model: MODELS.roleplay,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      maxTokens: 400,
    });
    return Response.json({ reply });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate a reply.";
    return Response.json({ error: message }, { status: 500 });
  }
}
