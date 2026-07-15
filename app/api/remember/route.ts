import { MODELS, completeJson } from "@/lib/claude";
import { memoryExtractionSystem, transcriptToText } from "@/lib/prompts";
import type { ChatMessage, Person } from "@/lib/types";

export const runtime = "nodejs";

interface RememberBody {
  person: Person;
  messages: ChatMessage[];
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

  const { person, messages } = (body ?? {}) as Partial<RememberBody>;

  if (!isPerson(person)) {
    return Response.json(
      { error: "A valid `person` is required." },
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
    const system = memoryExtractionSystem(person);
    const user = transcriptToText(messages, person.name);
    const { notes } = await completeJson<{ notes: string[] }>({
      model: MODELS.analysis,
      system,
      user,
      maxTokens: 512,
    });
    const clean = Array.isArray(notes)
      ? notes.filter((n): n is string => typeof n === "string" && n.trim().length > 0)
      : [];
    return Response.json({ notes: clean });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save what you learned.";
    return Response.json({ error: message }, { status: 500 });
  }
}
