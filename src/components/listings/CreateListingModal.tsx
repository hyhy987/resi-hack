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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("OFFER")}
              className={`flex-1 py-2 rounded text-sm font-medium ${
                type === "OFFER"
                  ? "bg-green-100 text-green-700 border-2 border-green-400"
                  : "bg-gray-50 text-gray-500 border border-gray-200"
              }`}
            >
              Offer Credits
            </button>
            <button
              type="button"
              onClick={() => setType("REQUEST")}
              className={`flex-1 py-2 rounded text-sm font-medium ${
                type === "REQUEST"
                  ? "bg-blue-100 text-blue-700 border-2 border-blue-400"
                  : "bg-gray-50 text-gray-500 border border-gray-200"
              }`}
            >
              Request Credits
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            min="1"
            max="99"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            rows={3}
            maxLength={500}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !amount}>
            {submitting ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
