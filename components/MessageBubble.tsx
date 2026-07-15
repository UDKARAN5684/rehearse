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
      })
    );
  }, [message.ts]);

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <span className="mb-1 px-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {isUser ? "You" : personaName}
      </span>
      <div
        className={[
          "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm sm:max-w-[75%]",
          isUser
            ? "rounded-br-md bg-indigo-600 text-white"
            : "rounded-bl-md border border-neutral-200 bg-white text-neutral-800 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-100",
        ].join(" ")}
      >
        {message.content}
      </div>
      <span className="mt-1 h-3 px-1 text-[10px] text-neutral-400 dark:text-neutral-500">
        {time}
      </span>
    </div>
  );
}
