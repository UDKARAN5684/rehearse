"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";
import MessageBubble from "@/components/MessageBubble";

export default function ChatWindow({
  messages,
  personaName,
  loading,
}: {
  messages: ChatMessage[];
  personaName: string;
  loading: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the newest message (and to the typing indicator).
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  return (
    <div
      ref={containerRef}
      className="scrollbar-slim flex-1 overflow-y-auto px-1 py-4"
      role="log"
      aria-live="polite"
      aria-label="Conversation transcript"
    >
      <div className="flex flex-col gap-4">
        {messages
          .filter((m) => m.content.trim().length > 0)
          .map((m, i) => (
            <MessageBubble
              key={`${m.ts}-${i}`}
              message={m}
              personaName={personaName}
            />
          ))}

        {loading && (
          <div className="flex animate-bubble-in flex-col items-start">
            <span className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--gray-500)]">
              {personaName}
            </span>
            <div
              className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[color:var(--gray-200)] bg-white px-4 py-3.5"
              role="status"
              aria-label={`${personaName} is typing`}
            >
              <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--gray-400)] [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--gray-400)] [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--gray-400)]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
