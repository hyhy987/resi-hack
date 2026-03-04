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
      body: JSON.stringify({ type, amount: Number(amount), notes }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Failed to create listing");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setType("OFFER");
    setAmount("");
    setNotes("");
    onCreated();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Listing">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 font-[Outfit]">
            Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("OFFER")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold font-[Outfit] transition-all cursor-pointer ${
                type === "OFFER"
                  ? "bg-[var(--offer-green-bg)] text-[var(--offer-green)] border-2 border-[var(--offer-green)]/40 shadow-lg shadow-[var(--offer-green)]/5"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]"
              }`}
            >
              Offer Credits
            </button>
            <button
              type="button"
              onClick={() => setType("REQUEST")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold font-[Outfit] transition-all cursor-pointer ${
                type === "REQUEST"
                  ? "bg-[var(--request-blue-bg)] text-[var(--request-blue)] border-2 border-[var(--request-blue)]/40 shadow-lg shadow-[var(--request-blue)]/5"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]"
              }`}
            >
              Request Credits
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 font-[Outfit]">
            Amount
          </label>
          <input
            type="number"
            min="1"
            max="99"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 text-sm"
            placeholder="1-99"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 font-[Outfit]">
            Notes <span className="normal-case font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm"
            rows={3}
            maxLength={500}
            placeholder="Any details about this listing..."
          />
        </div>

        {error && (
          <p className="text-sm text-[var(--danger)] p-2 rounded-lg bg-[var(--danger)]/10">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !amount}>
            {submitting ? "Creating..." : "Create Listing"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
