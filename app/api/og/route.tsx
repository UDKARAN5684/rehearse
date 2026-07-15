import { ImageResponse } from "next/og";

export const runtime = "edge";

function clampScore(v: string | null): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scoreColor(score: number): string {
  if (score >= 75) return "#34d399";
  if (score >= 50) return "#fbbf24";
  return "#fb7185";
}

function riskColor(risk: string): string {
  if (risk === "low") return "#34d399";
  if (risk === "high") return "#fb7185";
  return "#fbbf24";
}

const shell = {
  display: "flex",
  flexDirection: "column" as const,
  width: "100%",
  height: "100%",
  padding: "72px",
  background: "linear-gradient(135deg, #0b1020 0%, #1e1b4b 100%)",
  color: "white",
  fontFamily: "sans-serif",
};

function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          borderRadius: 16,
          background: "#6366f1",
          fontSize: 34,
          fontWeight: 800,
        }}
      >
        R
      </div>
      <span style={{ fontSize: 34, fontWeight: 700 }}>Rehearse</span>
    </div>
  );
}

function Tagline() {
  return (
    <div style={{ display: "flex", marginTop: "auto", fontSize: 28, color: "#a5b4fc" }}>
      Practice the conversations that scare you.
    </div>
  );
}

export function GET(req: Request): Response {
  const { searchParams } = new URL(req.url);
  const type =
    searchParams.get("type") === "premortem" ? "premortem" : "conversation";

  if (type === "premortem") {
    const risk = (searchParams.get("risk") || "medium").toLowerCase();
    const decision = (searchParams.get("decision") || "A big decision").slice(0, 160);
    return new ImageResponse(
      (
        <div style={shell}>
          <Wordmark />
          <div style={{ display: "flex", flexDirection: "column", marginTop: 60, gap: 28 }}>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 700, letterSpacing: "0.08em", color: "#c7d2fe" }}>
              PRE-MORTEM RISK MAP
            </div>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                background: riskColor(risk),
                color: "#0b1020",
                fontSize: 40,
                fontWeight: 800,
                padding: "10px 28px",
                borderRadius: 999,
                textTransform: "capitalize",
              }}
            >
              {risk} risk
            </div>
            <div style={{ display: "flex", fontSize: 52, fontWeight: 700, lineHeight: 1.15 }}>
              {decision}
            </div>
          </div>
          <Tagline />
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }

  const score = clampScore(searchParams.get("score"));
  const title = (searchParams.get("title") || "A hard conversation").slice(0, 80);
  const headline = (searchParams.get("headline") || "").slice(0, 200);
  return new ImageResponse(
    (
      <div style={shell}>
        <Wordmark />
        <div style={{ display: "flex", marginTop: 56, gap: 48, alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 260,
              height: 260,
              borderRadius: 999,
              border: `14px solid ${scoreColor(score)}`,
            }}
          >
            <div style={{ display: "flex", fontSize: 110, fontWeight: 800, color: scoreColor(score) }}>
              {score}
            </div>
            <div style={{ display: "flex", fontSize: 28, color: "#94a3b8" }}>/ 100</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>{title}</div>
            <div style={{ display: "flex", fontSize: 32, color: "#cbd5e1", lineHeight: 1.3 }}>
              {headline}
            </div>
          </div>
        </div>
        <Tagline />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
