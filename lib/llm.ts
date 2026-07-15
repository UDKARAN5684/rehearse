// Provider-agnostic LLM client over the OpenAI-compatible Chat Completions API.
// Defaults to Groq (open-source models). Swap providers by changing env vars —
// nothing else in the app needs to know which provider is behind it:
//   LLM_BASE_URL       (default https://api.groq.com/openai/v1)
//   GROQ_API_KEY       (or LLM_API_KEY as a generic fallback)
//   LLM_MODEL_FAST     (default llama-3.1-8b-instant)
//   LLM_MODEL_STRONG   (default llama-3.3-70b-versatile)
// e.g. OpenRouter: LLM_BASE_URL=https://openrouter.ai/api/v1 + LLM_API_KEY,
//      Together:   LLM_BASE_URL=https://api.together.xyz/v1  + LLM_API_KEY.

const BASE_URL = process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1";
const FAST = process.env.LLM_MODEL_FAST || "llama-3.1-8b-instant";
const STRONG = process.env.LLM_MODEL_STRONG || "llama-3.3-70b-versatile";

export const MODELS = {
  // fast, cheap model for the many chat / interview turns
  roleplay: FAST,
  premortem: FAST,
  // stronger model for the once-per-session structured synthesis
  analysis: STRONG,
  premortemReport: STRONG,
  scenario: STRONG,
} as const;

export interface ChatTurn {
  role: "system" | "user" | "assistant";
  content: string;
}

function apiKey(): string {
  const key = process.env.GROQ_API_KEY || process.env.LLM_API_KEY;
  if (!key) {
    throw new Error(
      "No LLM API key set. Add GROQ_API_KEY to .env.local (get one free at https://console.groq.com/keys).",
    );
  }
  return key;
}

function withSystem(system: string, messages: ChatTurn[]): ChatTurn[] {
  return [{ role: "system", content: system }, ...messages];
}

async function post(body: Record<string, unknown>): Promise<Response> {
  return fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify(body),
  });
}

async function failure(res: Response): Promise<Error> {
  const detail = await res.text().catch(() => "");
  return new Error(`LLM request failed (${res.status}): ${detail.slice(0, 300)}`);
}

/** Plain text completion — used where we don't stream. */
export async function complete(opts: {
  model: string;
  system: string;
  messages: ChatTurn[];
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const res = await post({
    model: opts.model,
    messages: withSystem(opts.system, opts.messages),
    max_tokens: opts.maxTokens ?? 1024,
    temperature: opts.temperature ?? 0.9,
  });
  if (!res.ok) throw await failure(res);
  const data = await res.json();
  return String(data?.choices?.[0]?.message?.content ?? "").trim();
}

/** Structured completion — asks for JSON mode and parses the result. */
export async function completeJson<T>(opts: {
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<T> {
  const res = await post({
    model: opts.model,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
    max_tokens: opts.maxTokens ?? 2048,
    temperature: 0.4,
    response_format: { type: "json_object" },
  });
  if (!res.ok) throw await failure(res);
  const data = await res.json();
  const content = String(data?.choices?.[0]?.message?.content ?? "");
  return JSON.parse(extractJson(content)) as T;
}

/**
 * Streaming text completion — returns a ReadableStream of raw text deltas
 * (already unwrapped from the provider's SSE frames) ready to pipe to the client.
 */
export async function streamText(opts: {
  model: string;
  system: string;
  messages: ChatTurn[];
  maxTokens?: number;
  temperature?: number;
}): Promise<ReadableStream<Uint8Array>> {
  const res = await post({
    model: opts.model,
    messages: withSystem(opts.system, opts.messages),
    max_tokens: opts.maxTokens ?? 1024,
    temperature: opts.temperature ?? 0.9,
    stream: true,
  });
  if (!res.ok || !res.body) throw await failure(res);

  const upstream = res.body;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      let buffer = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(payload);
              const delta = json?.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // ignore keep-alive comments / partial frames
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Model did not return a JSON object.");
  }
  return text.slice(start, end + 1);
}
