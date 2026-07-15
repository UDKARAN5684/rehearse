import { MODELS, completeJson, streamText } from "@/lib/llm";
import {
  premortemReportSystem,
  premortemSystem,
  transcriptToText,
} from "@/lib/prompts";
import type { ChatMessage, PremortemReport } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60; // LLM calls can exceed the 10s serverless default

type PremortemAction = "reply" | "report";

interface PremortemBody {
  messages: ChatMessage[];
  action: PremortemAction;
  decision?: string;
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

  const { messages, action } = (body ?? {}) as Partial<PremortemBody>;

  if (!isChatMessages(messages) || messages.length === 0) {
    return Response.json(
      { error: "`messages` must be a non-empty array of chat messages." },
      { status: 400 },
    );
  }
  if (action !== "reply" && action !== "report") {
    return Response.json(
      { error: '`action` must be either "reply" or "report".' },
      { status: 400 },
    );
  }

  try {
    if (action === "reply") {
      // The interviewer's turns stream token-by-token.
      const stream = await streamText({
        model: MODELS.premortem,
        system: premortemSystem(),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        maxTokens: 400,
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    // The final risk map is structured JSON, not streamed.
    const report = await completeJson<PremortemReport>({
      model: MODELS.premortemReport,
      system: premortemReportSystem(),
      user: transcriptToText(messages),
      maxTokens: 2048,
    });
    return Response.json({ report });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to process the pre-mortem request.";
    return Response.json({ error: message }, { status: 500 });
  }
}
