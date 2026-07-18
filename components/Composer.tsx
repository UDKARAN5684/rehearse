"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";

export default function Composer({
  onSend,
  disabled,
  placeholder,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea with its content, up to a max height.
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  // Focus on mount (entering the chat) and whenever the input becomes enabled
  // again after a reply, so the user can keep typing without re-clicking.
  useEffect(() => {
    if (!disabled) taRef.current?.focus();
  }, [disabled]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-[color:var(--gray-300)] bg-white p-2 transition-colors focus-within:border-[color:var(--gray-900)]">
      <label htmlFor="composer-input" className="sr-only">
        Your message
      </label>
      <textarea
        id="composer-input"
        ref={taRef}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        placeholder={placeholder ?? "Type your reply…"}
        className="max-h-40 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2.5 py-2 text-[15px] text-fg outline-none placeholder:text-muted/70 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!canSend}
        aria-label="Send message"
        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-[color:var(--gray-900)] text-white px-4 text-sm font-semibold transition-colors hover:bg-[color:var(--gray-700)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span>Send</span>
        <Icon name="arrowRight" size={15} strokeWidth={2.25} />
      </button>
    </div>
  );
}
