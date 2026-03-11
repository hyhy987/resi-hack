"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { SwapTimeline } from "@/components/swaps/SwapTimeline";
import { SwapActions } from "@/components/swaps/SwapActions";
import { SwapMessages } from "@/components/swaps/SwapMessages";
import { SwapInstructions } from "@/components/swaps/SwapInstructions";
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

  if (loading)
    return (
      <PageContainer>
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-block w-6 h-6 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
      </PageContainer>
    );
  if (!swap)
    return (
      <PageContainer>
        <div className="text-center py-20 text-[var(--text-muted)] animate-fade-in">
          Swap not found
        </div>
      </PageContainer>
    );

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
        <h1 className="text-3xl font-extrabold font-[Outfit] text-[var(--text-primary)] tracking-tight">
          Swap Details
        </h1>

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

      <div className="space-y-6">
        {/* ROW 1: Progress & Actions */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          <div className="lg:w-1/3 flex">
            <div className="glass-card-static p-6 flex-1 flex flex-col">
              <h2 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6 font-[Outfit]">
                Progress
              </h2>
              <div className="flex-1 flex flex-col justify-center">
                <SwapTimeline swap={swap} />
              </div>
            </div>
          </div>
          <div className="lg:w-2/3 flex">
            <div className="glass-card-static p-6 flex-1">
              <h2 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6 font-[Outfit]">
                Actions
              </h2>
              <SwapActions swap={swap} onRefresh={fetchSwap} />
            </div>
          </div>
        </div>

        {/* ROW 2: Instructions & Messages */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          <div className="lg:w-1/3 flex">
            <div className="flex-1">
              {isGiver && swap.status === "ACCEPTED" ? (
                <SwapInstructions swap={swap} partner={partner} />
              ) : (
                <div className="glass-card-static p-6 h-full flex flex-col items-center justify-center border-dashed border-2 border-[var(--border)] opacity-40">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                    Instructions pending
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="lg:w-2/3 flex">
            {/* THIS IS THE BOX THAT WAS CENTERED - added flex-col */}
            <div className="glass-card-static p-6 flex-1 flex flex-col overflow-hidden">
              <h2 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6 font-[Outfit]">
                Messages
              </h2>
              <div className="flex-1 overflow-hidden">
                <SwapMessages
                  swapId={swap.id}
                  messages={swap.messages}
                  onRefresh={fetchSwap}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
