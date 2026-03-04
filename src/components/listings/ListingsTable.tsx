"use client";

import { useState } from "react";
import { ListingData } from "@/types";
import { Badge, statusColor } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";

interface Props {
  listings: ListingData[];
  onRefresh: () => void;
}

export function ListingsTable({ listings, onRefresh }: Props) {
  const { currentUser, refreshUser } = useAuth();
  const [proposing, setProposing] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handlePropose = async (listing: ListingData) => {
    if (!currentUser) return;
    setProposing(listing.id);
    setError("");

    const res = await fetch("/api/swaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: listing.id, amount: listing.amount }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Failed to propose swap");
      setProposing(null);
      return;
    }

    const swap = await res.json();
    setProposing(null);
    onRefresh();
    refreshUser();
    window.location.href = `/swap/${swap.id}`;
  };

  const formatExpiry = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  if (listings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No listings found
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="text-sm text-red-600 mb-2">{error}</p>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="pb-2 font-medium text-gray-500">Type</th>
            <th className="pb-2 font-medium text-gray-500">User</th>
            <th className="pb-2 font-medium text-gray-500">Amount</th>
            <th className="pb-2 font-medium text-gray-500">Notes</th>
            <th className="pb-2 font-medium text-gray-500">Status</th>
            <th className="pb-2 font-medium text-gray-500">Expires</th>
            <th className="pb-2 font-medium text-gray-500">Action</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => (
            <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3">
                <Badge color={l.type === "OFFER" ? "green" : "blue"}>
                  {l.type}
                </Badge>
              </td>
              <td className="py-3 text-gray-900">{l.user.name}</td>
              <td className="py-3 font-medium">{l.amount}</td>
              <td className="py-3 text-gray-500 max-w-48 truncate">
                {l.notes || "—"}
              </td>
              <td className="py-3">
                <Badge color={statusColor(l.status)}>{l.status}</Badge>
              </td>
              <td className="py-3 text-gray-500">{formatExpiry(l.expiresAt)}</td>
              <td className="py-3">
                {l.status === "ACTIVE" &&
                  currentUser &&
                  l.userId !== currentUser.id && (
                    <Button
                      size="sm"
                      onClick={() => handlePropose(l)}
                      disabled={proposing === l.id}
                    >
                      {proposing === l.id ? "..." : "Propose Swap"}
                    </Button>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
