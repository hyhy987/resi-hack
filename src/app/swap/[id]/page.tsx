"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { SwapTimeline } from "@/components/swaps/SwapTimeline";
import { SwapActions } from "@/components/swaps/SwapActions";
import { SwapMessages } from "@/components/swaps/SwapMessages";
import { Badge, statusColor } from "@/components/ui/Badge";
import { SwapData } from "@/types";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

export default function SwapDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { currentUser } = useAuth();
  const [swap, setSwap] = useState<SwapData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSwap = useCallback(async () => {
    const res = await fetch(`/api/swaps/${id}`);
    if (res.ok) {
      setSwap(await res.json());
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchSwap();
  }, [fetchSwap]);

  if (loading) {
    return (
      <PageContainer>
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-block w-6 h-6 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (!swap) {
    return (
      <PageContainer>
        <div className="text-center py-20 text-[var(--text-muted)] animate-fade-in">
          Swap not found
        </div>
      </PageContainer>
    );
  }

  // Determine roles
  const isGiver =
    (swap.listing.type === "OFFER" &&
      currentUser?.id === swap.counterpartyId) ||
    (swap.listing.type === "REQUEST" && currentUser?.id === swap.proposerId);

  const partner =
    currentUser?.id === swap.proposerId ? swap.counterparty : swap.proposer;

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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold font-[Outfit] text-[var(--text-primary)] tracking-tight">
            Swap Details
          </h1>
          <Badge color={statusColor(swap.status)}>{swap.status}</Badge>
        </div>

        {/* Simple Telegram Contact Pill */}
        {partner.contactHandle && (
          <div className="flex items-center gap-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] px-4 py-2 rounded-2xl">
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase text-[var(--text-muted)] tracking-widest">
                Contact Partner
              </p>
              <p className="text-xs font-bold font-[Outfit]">{partner.name}</p>
            </div>
            <a
              href={`https://t.me/${partner.contactHandle.replace("@", "")}`}
              target="_blank"
              className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </a>
          </div>
        )}
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Left: Timeline & Manual Instructions */}
        <div className="lg:w-1/3 space-y-6">
          <div className="glass-card-static p-6 animate-fade-in-up stagger-1">
            <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-5 font-[Outfit]">
              Progress
            </h2>
            <SwapTimeline swap={swap} />
          </div>

          {/* Instruction Block - only shows for Giver when Accepted */}
          {isGiver && swap.status === "ACCEPTED" && (
            <div className="glass-card-static p-6 border-l-4 border-l-[var(--accent)] animate-fade-in-up">
              <h2 className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest mb-4 font-[Outfit]">
                Transfer Instructions
              </h2>
              <div className="space-y-4 text-[11px] leading-relaxed text-[var(--text-secondary)] font-medium">
                <p>
                  1. Open{" "}
                  <span className="text-[var(--text-primary)]">
                    NUS Dining Hall
                  </span>{" "}
                  app
                </p>
                <p>
                  2. Click{" "}
                  <span className="text-[var(--text-primary)]">
                    Transfer Credits
                  </span>{" "}
                  icon (top-right)
                </p>
                <div className="p-3 bg-[var(--bg-input)] rounded-xl border border-[var(--border-subtle)]">
                  <p className="text-[9px] text-[var(--text-muted)] mb-1 uppercase">
                    Search NUS ID
                  </p>
                  <p className="text-sm font-mono font-bold text-[var(--accent)]">
                    {partner.nusId || "E-------"}
                  </p>
                </div>
                <p>
                  3. Transfer exactly{" "}
                  <span className="text-[var(--text-primary)] font-bold">
                    {swap.amount} credits
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions + Messages */}
        <div className="lg:w-2/3 space-y-6">
          <div className="glass-card-static p-6 animate-fade-in-up stagger-2">
            <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-5 font-[Outfit]">
              Actions
            </h2>
            <SwapActions swap={swap} onRefresh={fetchSwap} />
          </div>

          <div className="glass-card-static p-6 animate-fade-in-up stagger-3">
            <SwapMessages
              swapId={swap.id}
              messages={swap.messages}
              onRefresh={fetchSwap}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
