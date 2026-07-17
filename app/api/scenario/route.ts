import { MODELS, completeJson } from "@/lib/llm";
import { scenarioBuilderSystem } from "@/lib/prompts";
import type { Difficulty, Scenario } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60; // LLM calls can exceed the 10s serverless default

interface ScenarioBody {
  situation: string;
  persona?: string;
  goal?: string;
}

function str(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { situation, persona, goal } = (body ?? {}) as Partial<ScenarioBody>;
  if (typeof situation !== "string" || situation.trim().length < 3) {
    return Response.json(
      { error: "Describe the situation you want to practice." },
      { status: 400 },
    );
  }

  const parts = [`Situation: ${situation.trim()}`];
  if (typeof persona === "string" && persona.trim()) {
    parts.push(`Who they're talking to: ${persona.trim()}`);
  }
  if (typeof goal === "string" && goal.trim()) {
    parts.push(`What they want: ${goal.trim()}`);
  }

  try {
    const raw = await completeJson<Partial<Scenario>>({
      model: MODELS.scenario,
      system: scenarioBuilderSystem(),
      user: parts.join("\n"),
      maxTokens: 1024,
    });

    // Normalize into a complete, valid Scenario — open models may omit keys.
    const difficulty: Difficulty =
      raw.difficulty === "easy" || raw.difficulty === "hard"
        ? raw.difficulty
        : "realistic";

    const scenario: Scenario = {
      id: "custom",
      emoji: "", // not displayed — the UI uses category line-icons, not emoji
      title: str(raw.title, "Your conversation"),
      category: "Custom",
      blurb: str(raw.blurb, ""),
      personaName: str(raw.personaName, "Them"),
      personaRole: str(raw.personaRole, "the other person"),
      personaBrief: str(raw.personaBrief, ""),
      difficulty,
      openingLine: str(raw.openingLine, "So… you wanted to talk?"),
      userGoal: str(raw.userGoal, situation.trim()),
    };

    return Response.json({ scenario });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Couldn't build that scenario.";
    return Response.json({ error: message }, { status: 500 });
  }
}
