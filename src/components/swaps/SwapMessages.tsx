"use client";

import { useState } from "react";
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
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Messages</h3>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400">No messages yet</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`text-sm p-3 rounded-lg ${
              m.userId === currentUser?.id
                ? "bg-indigo-50 ml-8"
                : "bg-gray-50 mr-8"
            }`}
          >
            <p className="font-medium text-xs text-gray-500 mb-1">
              {m.user.name} &middot;{" "}
              {new Date(m.createdAt).toLocaleTimeString()}
            </p>
            <p className="text-gray-800">{m.message}</p>
          </div>
        ))}
      </div>

      {currentUser && (
        <form onSubmit={send} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            maxLength={1000}
          />
          <Button type="submit" disabled={sending || !text.trim()} size="sm">
            Send
          </Button>
        </form>
      )}
    </div>
  );
}
