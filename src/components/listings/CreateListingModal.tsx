"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateListingModal({ open, onClose, onCreated }: Props) {
  const [type, setType] = useState<"OFFER" | "REQUEST">("OFFER");
  const [creditType, setCreditType] = useState<"BREAKFAST" | "DINNER">(
    "BREAKFAST",
  );
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        creditType,
        amount: Number(amount),
        notes,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(
        typeof data.error === "string"
          ? data.error
          : "Failed to create listing",
      );
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setType("OFFER");
    setCreditType("BREAKFAST");
    setAmount("");
    setNotes("");
    onCreated();
    onClose();
  };

  // Shared button class to ensure identical sizing
  const toggleBtnBase =
    "flex-1 h-11 rounded-xl text-sm font-bold transition-all cursor-pointer border flex items-center justify-center";

  return (
    <Modal open={open} onClose={onClose} title="Create Listing">
      <form onSubmit={handleSubmit} className="space-y-6 font-sans">
        <div>
          <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-3 ml-1">
            You will...?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("OFFER")}
              className={`${toggleBtnBase} ${
                type === "OFFER"
                  ? "bg-[var(--offer-green-bg)] text-[var(--offer-green)] border-[var(--offer-green)]/40 shadow-lg shadow-[var(--offer-green)]/5"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]"
              }`}
            >
              Offer Credits
            </button>
            <button
              type="button"
              onClick={() => setType("REQUEST")}
              className={`${toggleBtnBase} ${
                type === "REQUEST"
                  ? "bg-[var(--request-blue-bg)] text-[var(--request-blue)] border-[var(--request-blue)]/40 shadow-lg shadow-[var(--request-blue)]/5"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]"
              }`}
            >
              Request Credits
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-3 ml-1">
            Credit Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCreditType("BREAKFAST")}
              className={`${toggleBtnBase} ${
                creditType === "BREAKFAST"
                  ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-lg shadow-[var(--accent-glow)]"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]"
              }`}
            >
              Breakfast
            </button>
            <button
              type="button"
              onClick={() => setCreditType("DINNER")}
              className={`${toggleBtnBase} ${
                creditType === "DINNER"
                  ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-lg shadow-[var(--accent-glow)]"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]"
              }`}
            >
              Dinner
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] ml-1">
            Amount{" "}
            <span className="normal-case font-medium opacity-60">
              (Limit 1-3)
            </span>
          </label>
          <input
            type="number"
            min="1"
            max="3"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full h-11 px-4 text-sm bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl outline-none focus:border-[var(--accent)] font-sans"
            placeholder="How many credits?"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] ml-1">
            Notes{" "}
            <span className="normal-case font-medium opacity-60">
              (Optional)
            </span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl outline-none focus:border-[var(--accent)] font-sans resize-none"
            rows={3}
            maxLength={500}
            placeholder="e.g. For 1 dinner credit, I'll pay back 2 breakfast credits"
          />
        </div>

        {error && (
          <div className="text-[11px] font-bold text-[var(--danger)] p-3 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 animate-fade-in">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-12 text-xs font-bold uppercase tracking-widest"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || !amount}
            className="flex-[2] h-12 text-xs font-bold uppercase tracking-widest"
          >
            {submitting ? "Processing..." : "Publish Listing"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
