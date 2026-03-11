"use client";

import { useState, useEffect, useRef } from "react";
import { SwapMessageData } from "@/types";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";

interface Props {
  swapId: string;
  messages: SwapMessageData[];
  onRefresh: () => void;
}

export function SwapMessages({ swapId, messages, onRefresh }: Props) {
  const { currentUser } = useAuth();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);

    await fetch(`/api/swaps/${swapId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text.trim() }),
    });

    setText("");
    setSending(false);
    onRefresh();
  };

  return (
    <div className="flex flex-col h-[200px]">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 mb-2 custom-scrollbar"
      >
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest opacity-40">
              No messages yet
            </p>
          </div>
        )}
        {messages.map((m) => {
          const isMine = m.userId === currentUser?.id;
          return (
            <div
              key={m.id}
              className={`text-sm p-2.5 rounded-xl animate-fade-in ${
                isMine
                  ? "bg-[var(--accent)]/10 border border-[var(--accent)]/15 ml-8"
                  : "bg-[var(--bg-base)] border border-[var(--border-subtle)] mr-8"
              }`}
            >
              <div className="flex justify-between items-center mb-0.5">
                <p className="font-bold text-[9px] text-[var(--text-muted)] uppercase tracking-tight">
                  {m.user.name}
                </p>
                <p className="text-[8px] text-[var(--text-muted)] opacity-50 font-mono">
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <p className="text-[var(--text-secondary)] text-[11px] leading-snug">
                {m.message}
              </p>
            </div>
          );
        })}
      </div>

      {currentUser && (
        <form
          onSubmit={send}
          className="flex gap-2 pt-2.5 border-t border-[var(--border-subtle)]"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Say something..."
            className="flex-1 bg-[var(--bg-input)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-xl text-xs outline-none focus:border-[var(--accent)] transition-all font-sans"
            maxLength={1000}
          />
          <Button
            type="submit"
            disabled={sending || !text.trim()}
            className="px-4 h-[32px] text-[10px] font-bold uppercase tracking-widest"
          >
            {sending ? "..." : "Send"}
          </Button>
        </form>
      )}
    </div>
  );
}
