"use client";

import { useState } from "react";
import { SwapData } from "@/types";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";

interface Props {
  swap: SwapData;
  onRefresh: () => void;
}

export function SwapActions({ swap, onRefresh }: Props) {
  const { currentUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!currentUser) return null;

  const isProposer = swap.proposerId === currentUser.id;
  const isCounterparty = swap.counterpartyId === currentUser.id;
  if (!isProposer && !isCounterparty) return null;

  const isGiver =
    (swap.listing.type === "OFFER" && isCounterparty) ||
    (swap.listing.type === "REQUEST" && isProposer);

  const alreadyConfirmed = isGiver
    ? swap.giverConfirmed
    : swap.receiverConfirmed;

  const action = async (url: string, successMsg: string) => {
    setLoading(true);
    setError("");
    const res = await fetch(url, { method: "POST" });
    if (!res.ok) {
      const data = await res.json();
      const msg = typeof data.error === "string" ? data.error : "Action failed";
      setError(msg);
      toast(msg, "error");
    } else {
      toast(successMsg, "success");
    }
    setLoading(false);
    await refreshUser();
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-[var(--danger)] p-2 rounded-lg bg-[var(--danger)]/10 animate-fade-in">
          {error}
        </p>
      )}

      <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--text-muted)]">Amount</span>
          <span className="font-semibold font-[Outfit] text-[var(--text-primary)]">
            {swap.amount} {swap.listing.creditType.toLowerCase()}{" "}
            {swap.amount === 1 ? "credit" : "credits"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-muted)]">Your role</span>
          <span className="font-semibold font-[Outfit] text-[var(--text-primary)]">
            {isGiver ? "Giver" : "Receiver"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-muted)]">Proposer</span>
          <span className="text-[var(--text-secondary)]">
            {swap.proposer.name}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-muted)]">Counterparty</span>
          <span className="text-[var(--text-secondary)]">
            {swap.counterparty.name}
          </span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {swap.status === "PROPOSED" && isCounterparty && (
          <Button
            onClick={() => action(`/api/swaps/${swap.id}/accept`, "Swap accepted!")}
            disabled={loading}
          >
            Accept Swap
          </Button>
        )}

        {(swap.status === "ACCEPTED" ||
          swap.status === "CONFIRMED_BY_GIVER" ||
          swap.status === "CONFIRMED_BY_RECEIVER") &&
          !alreadyConfirmed && (
            <Button
              variant="success"
              onClick={() => action(`/api/swaps/${swap.id}/confirm`, "Transfer confirmed!")}
              disabled={loading}
            >
              Confirm Transfer
            </Button>
          )}

        {alreadyConfirmed && swap.status !== "COMPLETED" && (
          <span className="text-sm text-[var(--success)] font-medium font-[Outfit] py-2 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            You have confirmed. Waiting for the other party.
          </span>
        )}

        {swap.status !== "COMPLETED" && swap.status !== "CANCELLED" && (
          <Button
            variant="danger"
            onClick={() => action(`/api/swaps/${swap.id}/cancel`, "Swap cancelled")}
            disabled={loading}
          >
            Cancel
          </Button>
        )}

        {swap.status === "COMPLETED" && (
          <div className="flex items-center gap-2 text-sm text-[var(--success)] font-medium font-[Outfit] py-2 px-3 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Swap completed! Credits have been transferred.
          </div>
        )}
      </div>
    </div>
  );
}
