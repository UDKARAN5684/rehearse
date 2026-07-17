"use client";

import { useEffect, useState } from "react";
import type { ChatMessage } from "@/lib/types";

export default function MessageBubble({
  message,
  personaName,
}: {
  message: ChatMessage;
  personaName: string;
}) {
  const isUser = message.role === "user";

  // Format the timestamp only after mount to avoid SSR/locale hydration drift.
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    setTime(
      new Date(message.ts).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    );
  }, [message.ts]);

  return (
    <div
      className={`flex animate-bubble-in flex-col ${isUser ? "items-end" : "items-start"}`}
    >
      <span className="mb-1 px-1 text-xs font-semibold text-muted">
        {isUser ? "You" : personaName}
      </span>
      <div
        className={[
          "max-w-[85%] whitespace-pre-wrap break-words rounded-3xl px-4 py-2.5 text-[15px] leading-relaxed sm:max-w-[78%]",
          isUser
            ? "rounded-br-lg bg-accent text-accent-fg shadow-glow-sm"
            : "rounded-bl-lg border border-border bg-surface text-fg shadow-sm",
        ].join(" ")}
      >
        {message.content}
      </div>
      <span className="mt-1 h-4 px-1 text-[11px] text-muted/70">{time}</span>
    </div>
  );
}
