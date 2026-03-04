"use client";

import { useState } from "react";
import { SwapData } from "@/types";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";

interface Props {
  swap: SwapData;
  onRefresh: () => void;
}

export function SwapActions({ swap, onRefresh }: Props) {
  const { currentUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!currentUser) return null;

  const isProposer = swap.proposerId === currentUser.id;
  const isCounterparty = swap.counterpartyId === currentUser.id;
  if (!isProposer && !isCounterparty) return null;

  const isGiver =
    (swap.listing.type === "OFFER" && isCounterparty) ||
    (swap.listing.type === "REQUEST" && isProposer);

  const alreadyConfirmed = isGiver ? swap.giverConfirmed : swap.receiverConfirmed;

  const action = async (url: string) => {
    setLoading(true);
    setError("");
    const res = await fetch(url, { method: "POST" });
    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Action failed");
    }
    setLoading(false);
    await refreshUser();
    onRefresh();
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
        <p><span className="text-gray-500">Amount:</span> <span className="font-semibold">{swap.amount} credits</span></p>
        <p><span className="text-gray-500">Your role:</span> <span className="font-semibold">{isGiver ? "Giver" : "Receiver"}</span></p>
        <p><span className="text-gray-500">Proposer:</span> {swap.proposer.name}</p>
        <p><span className="text-gray-500">Counterparty:</span> {swap.counterparty.name}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {swap.status === "PROPOSED" && isCounterparty && (
          <Button onClick={() => action(`/api/swaps/${swap.id}/accept`)} disabled={loading}>
            Accept Swap
          </Button>
        )}

        {(swap.status === "ACCEPTED" || swap.status === "CONFIRMED_BY_GIVER" || swap.status === "CONFIRMED_BY_RECEIVER") &&
          !alreadyConfirmed && (
            <Button
              variant="success"
              onClick={() => action(`/api/swaps/${swap.id}/confirm`)}
              disabled={loading}
            >
              Confirm Transfer
            </Button>
          )}

        {alreadyConfirmed && swap.status !== "COMPLETED" && (
          <span className="text-sm text-green-600 font-medium py-2">
            You have confirmed. Waiting for the other party.
          </span>
        )}

        {swap.status !== "COMPLETED" && swap.status !== "CANCELLED" && (
          <Button
            variant="danger"
            onClick={() => action(`/api/swaps/${swap.id}/cancel`)}
            disabled={loading}
          >
            Cancel
          </Button>
        )}

        {swap.status === "COMPLETED" && (
          <span className="text-sm text-green-600 font-medium py-2">
            Swap completed! Credits have been transferred.
          </span>
        )}
      </div>
    </div>
  );
}
