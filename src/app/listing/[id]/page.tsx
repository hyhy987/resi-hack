"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge, statusColor } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { formatExpiryWithSuffix } from "@/lib/format";
import Link from "next/link";

interface ListingDetail {
  id: string;
  userId: string;
  type: "OFFER" | "REQUEST";
  creditType: "BREAKFAST" | "DINNER";
  amount: number;
  notes: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    contactHandle: string;
    breakfastCredits: number;
    dinnerCredits: number;
  };
  swaps: {
    id: string;
    status: string;
    proposerId: string;
    counterpartyId: string;
  }[];
}

function ListingDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const fromTab = searchParams.get("fromTab") || "OFFER";
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

  if (loading)
    return (
      <PageContainer>
        <div className="text-center py-20 text-[var(--text-muted)]">
          Loading...
        </div>
      </PageContainer>
    );
  if (!listing)
    return (
      <PageContainer>
        <div className="text-center py-20 text-[var(--text-muted)]">
          Listing not found
        </div>
      </PageContainer>
    );

  const isOffer = listing.type === "OFFER";
  const isMine = currentUser?.id === listing.userId;
  const canPropose = listing.status === "ACTIVE" && currentUser && !isMine;

  const existingSwap = listing.swaps.find(
    (s) =>
      (s.proposerId === currentUser?.id ||
        s.counterpartyId === currentUser?.id) &&
      s.status !== "CANCELLED",
  );

  const displayCredits =
    listing.creditType === "BREAKFAST"
      ? listing.user.breakfastCredits
      : listing.user.dinnerCredits;

  return (
    <PageContainer>
      <div className="mb-6 animate-fade-in">
        <Link
          href={`/?tab=${fromTab}`}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors font-[Outfit]"
        >
          &larr; Back to Marketplace
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 glass-card-static p-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-8">
            <Badge color={isOffer ? "green" : "blue"}>
              {isOffer ? "OFFERING" : "REQUESTING"}
            </Badge>
            <Badge color={statusColor(listing.status)}>{listing.status}</Badge>
          </div>

          <div className="mb-8">
            <div className="flex items-baseline gap-2.5">
              <span
                className={`text-6xl font-black font-[Outfit] tracking-tighter ${isMine ? "text-[var(--text-primary)]" : isOffer ? "text-[var(--offer-green)]" : "text-[var(--request-blue)]"}`}
              >
                {listing.amount}
              </span>
              <span className="text-xl font-bold font-[Outfit] text-[var(--text-muted)] uppercase tracking-tight">
                {listing.creditType.toLowerCase()}{" "}
                {listing.amount === 1 ? "credit" : "credits"}
              </span>
            </div>
          </div>

          {listing.notes && (
            <div className="mb-8">
              <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3 font-[Outfit]">
                Notes
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
                {listing.notes}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
            <span>{formatExpiryWithSuffix(listing.expiresAt)}</span>
            <span className="opacity-30">&middot;</span>
            <span>
              Posted {new Date(listing.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="lg:w-80 space-y-4">
          <div className="glass-card-static p-6 animate-fade-in-up stagger-2">
            <h3 className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-[0.2em] mb-6 font-[Outfit]">
              {isOffer ? "Seller Identity" : "Buyer Identity"}
            </h3>

            <div className="flex items-center gap-4 mb-8">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-[Outfit] ${isOffer ? "bg-[var(--offer-green-bg)] text-[var(--offer-green)]" : "bg-[var(--request-blue-bg)] text-[var(--request-blue)]"}`}
              >
                {listing.user.name.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-bold font-[Outfit] text-[var(--text-primary)] leading-none mb-1">
                  {listing.user.name}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
                <p className="text-[9px] font-bold uppercase text-[var(--text-muted)] mb-1 tracking-widest">
                  {listing.creditType.toLowerCase()} balance
                </p>
                <p className="text-base font-bold font-[Outfit] text-[var(--text-primary)]">
                  {displayCredits} Available
                </p>
              </div>

              {listing.user.contactHandle && (
                <div className="p-4 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
                  <p className="text-[9px] font-bold uppercase text-[var(--text-muted)] mb-1 tracking-widest">
                    Telegram
                  </p>
                  <a
                    href={`https://t.me/${listing.user.contactHandle.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent)] hover:underline transition-all font-bold text-sm block truncate"
                  >
                    {listing.user.contactHandle}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card-static p-6 animate-fade-in-up stagger-3">
            {error && (
              <p className="text-xs text-[var(--danger)] mb-4 p-3 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 font-bold">
                {error}
              </p>
            )}

            {existingSwap ? (
              <div className="text-center">
                <p className="text-xs font-medium text-[var(--text-secondary)] mb-5 leading-relaxed">
                  {isMine
                    ? "Someone has proposed a swap! View to finalize."
                    : "You have an active swap for this listing."}
                </p>
                <Button
                  variant="primary"
                  className="w-full py-5 text-xs font-bold uppercase tracking-[0.2em]"
                  onClick={() => router.push(`/swap/${existingSwap.id}`)}
                >
                  View Swap Process
                </Button>
              </div>
            ) : (
              <>
                {canPropose && (
                  <>
                    <p className="text-xs font-medium text-[var(--text-secondary)] mb-6 leading-relaxed">
                      {isOffer
                        ? `${listing.user.name} is offering ${listing.amount} ${listing.creditType.toLowerCase()} credits.`
                        : `${listing.user.name} needs ${listing.amount} ${listing.creditType.toLowerCase()} credits.`}
                    </p>
                    <Button
                      className="w-full py-6 text-sm font-bold uppercase tracking-[0.2em]"
                      onClick={handlePropose}
                      disabled={proposing}
                    >
                      {proposing ? "Proposing..." : "Propose Swap"}
                    </Button>
                  </>
                )}
                {isMine && (
                  <p className="text-xs text-[var(--text-muted)] text-center font-bold uppercase tracking-widest italic opacity-50">
                    Your Listing
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

export default function ListingDetailPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="text-center py-20 text-[var(--text-muted)]">
            Loading...
          </div>
        </PageContainer>
      }
    >
      <ListingDetailPageContent />
    </Suspense>
  );
}
