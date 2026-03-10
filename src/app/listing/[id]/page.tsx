"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge, statusColor } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

interface ListingDetail {
  id: string;
  userId: string;
  type: "OFFER" | "REQUEST";
  amount: number;
  notes: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    nusId: string; // Added NUS ID
    contactHandle: string;
    trackedCredits: number;
  };
  swaps: {
    id: string;
    status: string;
    proposerId: string;
    counterpartyId: string;
  }[];
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { currentUser, refreshUser } = useAuth();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposing, setProposing] = useState(false);
  const [error, setError] = useState("");

  const fetchListing = useCallback(async () => {
    const res = await fetch(`/api/listings/${id}`);
    if (res.ok) {
      setListing(await res.json());
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const handlePropose = async () => {
    if (!currentUser || !listing) return;
    setProposing(true);
    setError("");

    const res = await fetch("/api/swaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: listing.id, amount: listing.amount }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(
        typeof data.error === "string" ? data.error : "Failed to propose swap",
      );
      setProposing(false);
      return;
    }

    const swap = await res.json();
    await refreshUser();
    router.push(`/swap/${swap.id}`);
  };

  const formatExpiry = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m remaining`;
    return `${mins}m remaining`;
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="text-center py-20 text-[var(--text-muted)] animate-fade-in">
          Loading...
        </div>
      </PageContainer>
    );
  }

  if (!listing) {
    return (
      <PageContainer>
        <div className="text-center py-20 text-[var(--text-muted)] animate-fade-in">
          Listing not found
        </div>
      </PageContainer>
    );
  }

  const isOffer = listing.type === "OFFER";
  const isMine = currentUser?.id === listing.userId;
  const canPropose = listing.status === "ACTIVE" && currentUser && !isMine;

  const existingSwap = listing.swaps.find(
    (s) =>
      (s.proposerId === currentUser?.id ||
        s.counterpartyId === currentUser?.id) &&
      s.status !== "CANCELLED",
  );

  return (
    <PageContainer>
      <div className="mb-6 animate-fade-in">
        <Link
          href="/"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors font-[Outfit]"
        >
          &larr; Back to Marketplace
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main listing info */}
        <div className="flex-1 glass-card-static p-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6">
            <Badge color={isOffer ? "green" : "blue"}>
              {isOffer ? "OFFERING" : "REQUESTING"}
            </Badge>
            <Badge color={statusColor(listing.status)}>{listing.status}</Badge>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-5xl font-extrabold font-[Outfit] ${
                  isMine
                    ? "text-[var(--text-primary)]"
                    : isOffer
                      ? "text-[var(--offer-green)]"
                      : "text-[var(--request-blue)]"
                }`}
              >
                {listing.amount}
              </span>
              <span className="text-lg text-[var(--text-muted)] font-[Outfit]">
                credits
              </span>
            </div>
          </div>

          {listing.notes && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 font-[Outfit]">
                Notes
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {listing.notes}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
            <span>{formatExpiry(listing.expiresAt)}</span>
            <span>&middot;</span>
            <span>
              Posted {new Date(listing.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* User info + actions */}
        <div className="lg:w-80 space-y-4">
          <div className="glass-card-static p-6 animate-fade-in-up stagger-2">
            <h3 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-widest mb-4 font-[Outfit]">
              {isOffer ? "Seller Identity" : "Buyer Identity"}
            </h3>

            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold font-[Outfit] ${
                  isOffer
                    ? "bg-[var(--offer-green-bg)] text-[var(--offer-green)]"
                    : "bg-[var(--request-blue-bg)] text-[var(--request-blue)]"
                }`}
              >
                {listing.user.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold font-[Outfit] text-[var(--text-primary)] leading-tight">
                  {listing.user.name}
                </p>
                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-tighter">
                  {listing.user.nusId || "No ID Linked"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
                <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1 tracking-widest">
                  {listing.user.name}'s credits
                </p>
                <p className="text-sm font-bold font-[Outfit] text-[var(--text-primary)]">
                  {listing.user.trackedCredits}
                </p>
              </div>

              {listing.user.contactHandle && (
                <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
                  <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1 tracking-widest">
                    Telegram
                  </p>
                  <a
                    href={`https://t.me/${listing.user.contactHandle.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent)] hover:underline transition-all font-bold text-sm"
                  >
                    {listing.user.contactHandle}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Action card */}
          <div className="glass-card-static p-6 animate-fade-in-up stagger-3">
            {error && (
              <p className="text-xs text-[var(--danger)] mb-4 p-2.5 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 font-medium">
                {error}
              </p>
            )}

            {existingSwap ? (
              <div className="text-center">
                <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
                  {isMine
                    ? "Someone has proposed a swap! View the process to finalize."
                    : "You have an active swap for this listing."}
                </p>
                <Button
                  variant="primary"
                  className="w-full py-4 text-xs font-bold uppercase tracking-widest"
                  onClick={() => router.push(`/swap/${existingSwap.id}`)}
                >
                  View Swap Process
                </Button>
              </div>
            ) : (
              <>
                {canPropose && (
                  <>
                    <p className="text-xs text-[var(--text-secondary)] mb-5 leading-relaxed">
                      {isOffer
                        ? `${listing.user.name} is offering ${listing.amount} credits. Propose a swap to receive them.`
                        : `${listing.user.name} needs ${listing.amount} credits. Propose a swap to send them.`}
                    </p>
                    <Button
                      className="w-full py-5 text-sm font-bold uppercase tracking-widest"
                      onClick={handlePropose}
                      disabled={proposing}
                    >
                      {proposing ? "Proposing..." : "Propose Swap"}
                    </Button>
                  </>
                )}

                {isMine && (
                  <div className="text-center py-2">
                    <p className="text-xs text-[var(--text-muted)] font-medium italic">
                      This is your listing.
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                      Waiting for a community proposal...
                    </p>
                  </div>
                )}

                {!currentUser && (
                  <p className="text-xs text-[var(--text-muted)] text-center font-medium">
                    Please login to participate.
                  </p>
                )}

                {listing.status !== "ACTIVE" && !isMine && (
                  <p className="text-xs text-[var(--text-muted)] text-center font-medium">
                    This listing is no longer active.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
