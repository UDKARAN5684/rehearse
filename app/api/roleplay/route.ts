import { MODELS, streamText } from "@/lib/llm";
import { roleplaySystem } from "@/lib/prompts";
import type { ChatMessage, Person, Scenario } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60; // LLM calls can exceed the 10s serverless default

interface RoleplayBody {
  scenario: Scenario;
  messages: ChatMessage[];
  person?: Person;
}

function isPerson(value: unknown): value is Person {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;
  return typeof p.name === "string" && typeof p.relationship === "string";
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

  const { scenario, messages, person } = (body ?? {}) as Partial<RoleplayBody>;

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
    // The chat transcript should start with a user turn. The scenario's opening
    // line is seeded client-side as the first assistant message, so fold any
    // leading assistant turn(s) into the system prompt and drop them here.
    const opening: string[] = [];
    let convo = messages;
    while (convo.length > 0 && convo[0].role === "assistant") {
      opening.push(convo[0].content);
      convo = convo.slice(1);
    }
    if (convo.length === 0) {
      return Response.json({ error: "Nothing to reply to yet." }, { status: 400 });
    }

    let system = roleplaySystem(scenario, isPerson(person) ? person : undefined);
    if (opening.length > 0) {
      system += `\n\nYou have already opened this conversation by saying: "${opening.join(" ")}" — continue naturally from there and do not repeat your opening.`;
    }

    // Stream the persona's reply token-by-token.
    const stream = await streamText({
      model: MODELS.roleplay,
      system,
      messages: convo.map((m) => ({ role: m.role, content: m.content })),
      maxTokens: 400,
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate a reply.";
    return Response.json({ error: message }, { status: 500 });
  }
}
