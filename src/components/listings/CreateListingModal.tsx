"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  MAX_SWAP_AMOUNT,
  MAX_DAILY_LISTINGS,
} from "@/lib/constants";

const NOTES_MAX = 500;

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
  const [amountError, setAmountError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const amountNum = amount ? parseInt(amount, 10) : NaN;
  const isAmountValid =
    !isNaN(amountNum) &&
    amountNum >= 1 &&
    amountNum <= MAX_SWAP_AMOUNT &&
    Number.isInteger(amountNum);
  const isNotesValid = notes.length <= NOTES_MAX;
  const isFormValid = isAmountValid && isNotesValid;

  useEffect(() => {
    if (!amount) {
      setAmountError("");
      return;
    }
    if (isNaN(amountNum) || !Number.isInteger(amountNum)) {
      setAmountError("Enter a whole number");
      return;
    }
    if (amountNum < 1 || amountNum > MAX_SWAP_AMOUNT) {
      setAmountError(`Amount must be between 1 and ${MAX_SWAP_AMOUNT}`);
      return;
    }
    setAmountError("");
  }, [amount, amountNum]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        creditType,
        amount: amountNum,
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
    setShowSuccess(true);
    setTimeout(() => {
      setType("OFFER");
      setCreditType("BREAKFAST");
      setAmount("");
      setNotes("");
      setShowSuccess(false);
      onCreated();
      onClose();
    }, 600);
  };

  const incrementAmount = () => {
    if (!amount || isNaN(amountNum)) {
      setAmount("1");
      return;
    }
    const next = amountNum + 1;
    if (next <= MAX_SWAP_AMOUNT) setAmount(String(next));
  };

  const decrementAmount = () => {
    if (!amount || isNaN(amountNum)) return;
    const next = amountNum - 1;
    if (next >= 1) setAmount(String(next));
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
              (Limit 1-{MAX_SWAP_AMOUNT})
            </span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={decrementAmount}
              disabled={!amountNum || amountNum <= 1}
              className="w-11 h-11 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] flex items-center justify-center text-lg font-bold text-[var(--text-primary)] hover:border-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              max={MAX_SWAP_AMOUNT}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={() => {
                if (amount && !isAmountValid) {
                  setAmountError(`Enter 1–${MAX_SWAP_AMOUNT}`);
                }
              }}
              className="flex-1 h-11 px-4 text-sm bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl outline-none focus:border-[var(--accent)] font-sans text-center"
              placeholder="0"
              required
            />
            <button
              type="button"
              onClick={incrementAmount}
              disabled={amountNum >= MAX_SWAP_AMOUNT}
              className="w-11 h-11 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] flex items-center justify-center text-lg font-bold text-[var(--text-primary)] hover:border-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              +
            </button>
          </div>
          {amountError && (
            <p className="text-[11px] font-bold text-[var(--danger)] ml-1">
              {amountError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] ml-1">
              Notes{" "}
              <span className="normal-case font-medium opacity-60">
                (Optional)
              </span>
            </label>
            <span
              className={`text-[10px] font-medium ${
                notes.length > NOTES_MAX
                  ? "text-[var(--danger)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              {notes.length}/{NOTES_MAX}
            </span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl outline-none focus:border-[var(--accent)] font-sans resize-none"
            rows={3}
            maxLength={NOTES_MAX}
            placeholder="e.g. For 1 dinner credit, I'll pay back 2 breakfast credits"
          />
        </div>

        {error && (
          <div className="text-[11px] font-bold text-[var(--danger)] p-3 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 animate-fade-in">
            {error}
          </div>
        )}

        {showSuccess && (
          <div className="text-[11px] font-bold text-[var(--offer-green)] p-3 rounded-xl bg-[var(--offer-green-bg)] border border-[var(--offer-green)]/30 animate-fade-in">
            Listing published!
          </div>
        )}

        <p className="text-[10px] text-[var(--text-muted)] -mt-2">
          Limit: {MAX_DAILY_LISTINGS} listings per day
        </p>

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
            disabled={submitting || !isFormValid}
            className="flex-[2] h-12 text-xs font-bold uppercase tracking-widest"
          >
            {submitting ? "Processing..." : "Publish Listing"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
