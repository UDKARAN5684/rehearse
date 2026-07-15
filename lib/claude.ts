// Server-only helpers around the Anthropic SDK.
// Model routing: cheap model for the many roleplay turns, stronger model for
// the once-per-session structured analysis. See README for the cost rationale.
import Anthropic from "@anthropic-ai/sdk";

export const MODELS = {
  roleplay: "claude-haiku-4-5-20251001",
  analysis: "claude-sonnet-5",
  premortem: "claude-haiku-4-5-20251001",
  premortemReport: "claude-sonnet-5",
} as const;

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

function client(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Copy .env.example to .env.local and add your key.",
    );
  }
  return new Anthropic({ apiKey });
}

function textOf(res: Anthropic.Message): string {
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

/** Plain text completion — used for roleplay / interview turns. */
export async function complete(opts: {
  model: string;
  system: string;
  messages: ChatTurn[];
  maxTokens?: number;
}): Promise<string> {
  const res = await client().messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens ?? 1024,
    system: opts.system,
    messages: opts.messages,
  });
  return textOf(res).trim();
}

/**
 * Structured completion — forces a single JSON object by prefilling "{" on the
 * assistant turn, then parses it. Used for the graded Report / PremortemReport.
 */
export async function completeJson<T>(opts: {
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<T> {
  const res = await client().messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens ?? 2048,
    system: opts.system,
    messages: [
      { role: "user", content: opts.user },
      { role: "assistant", content: "{" },
    ],
  });
  const raw = "{" + textOf(res);
  return JSON.parse(extractJson(raw)) as T;
}

function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Model did not return a JSON object.");
  }
  return text.slice(start, end + 1);
}
