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
      <span className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--gray-500)]">
        {isUser ? "You" : personaName}
      </span>
      <div
        className={[
          "max-w-[85%] whitespace-pre-wrap break-words px-4 py-2.5 text-[15px] leading-relaxed sm:max-w-[78%]",
          isUser
            ? "rounded-2xl rounded-br-md bg-[color:var(--gray-900)] text-white"
            : "rounded-2xl rounded-bl-md border border-[color:var(--gray-200)] bg-white text-[color:var(--gray-900)]",
        ].join(" ")}
      >
        {message.content}
      </div>
      <span className="mt-1 h-4 px-1 text-[11px] text-[color:var(--gray-400)]">{time}</span>
    </div>
  );
}
