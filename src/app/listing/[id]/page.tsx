"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge, statusColor } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
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
  const { toast } = useToast();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposing, setProposing] = useState(false);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState<any[]>([]);

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

  // Fetch auto-matches
  useEffect(() => {
    if (!id) return;
    fetch(`/api/listings/matches?listingId=${id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setMatches)
      .catch(() => {});
  }, [id]);

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
      const msg = typeof data.error === "string" ? data.error : "Failed to propose swap";
      setError(msg);
      toast(msg, "error");
      setProposing(false);
      return;
    }

    const swap = await res.json();
    toast("Swap proposed successfully!", "success");
    await refreshUser();
    router.push(`/swap/${swap.id}`);
  };

  if (loading)
    return (
      <PageContainer>
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-block w-6 h-6 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
      </PageContainer>
    );
  if (!listing)
    return (
      <PageContainer>
        <div className="text-center py-20 animate-fade-in">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-40">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <p className="text-[var(--text-muted)] font-[Outfit] text-lg mb-2">Listing not found</p>
          <p className="text-sm text-[var(--text-muted)] opacity-60 mb-4">It may have been removed or expired.</p>
          <Link href="/">
            <Button variant="secondary" size="sm">Back to Marketplace</Button>
          </Link>
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
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors font-[Outfit] group"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Marketplace
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 glass-card-static p-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-8">
            <Badge color={isOffer ? "green" : "blue"}>
              {isOffer ? "OFFERING" : "REQUESTING"}
            </Badge>
            <Badge color={statusColor(listing.status)}>{listing.status}</Badge>
            {listing.creditType === "BREAKFAST" ? (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-[var(--warning)] bg-[var(--warning)]/8 px-2 py-0.5 rounded border border-[var(--warning)]/15">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4" /><path d="m4.93 10.93 1.41 1.41" /><path d="M2 18h2" /><path d="M20 18h2" /><path d="m19.07 10.93-1.41 1.41" /><path d="M22 22H2" /><path d="M16 18a4 4 0 0 0-8 0" />
                </svg>
                Breakfast
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-[var(--request-blue)] bg-[var(--request-blue-bg)] px-2 py-0.5 rounded border border-[var(--request-blue)]/15">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
                Dinner
              </span>
            )}
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
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {formatExpiryWithSuffix(listing.expiresAt)}
            </span>
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
              <p className="text-xs text-[var(--danger)] mb-4 p-3 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 font-bold animate-fade-in">
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
                      className="w-full py-6 text-sm font-bold uppercase tracking-[0.2em] group"
                      onClick={handlePropose}
                      disabled={proposing}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {proposing ? (
                          <>
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Proposing...
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 1l4 4-4 4" />
                              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                              <path d="M7 23l-4-4 4-4" />
                              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                            </svg>
                            Propose Swap
                          </>
                        )}
                      </span>
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

      {/* Auto-match suggestions */}
      {matches.length > 0 && listing.status === "ACTIVE" && (
        <div className="mt-8 animate-fade-in-up stagger-4">
          <div className="flex items-center gap-2 mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <h3 className="text-sm font-bold font-[Outfit] text-[var(--text-primary)]">
              Suggested Matches
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/15">
              {matches.length} found
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {matches.map((match: any) => (
              <Link
                key={match.id}
                href={`/listing/${match.id}`}
                className="glass-card p-4 group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${match.type === "OFFER" ? "bg-[var(--offer-green-bg)] text-[var(--offer-green)]" : "bg-[var(--request-blue-bg)] text-[var(--request-blue)]"}`}>
                    {match.type === "OFFER" ? "Offering" : "Requesting"}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                    {match.creditType.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className={`text-2xl font-black font-[Outfit] ${match.type === "OFFER" ? "text-[var(--offer-green)]" : "text-[var(--request-blue)]"}`}>
                    {match.amount}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {match.amount === 1 ? "credit" : "credits"}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  by {match.user.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default function ListingDetailPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-block w-6 h-6 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
          </div>
        </PageContainer>
      }
    >
      <ListingDetailPageContent />
    </Suspense>
  );
}
