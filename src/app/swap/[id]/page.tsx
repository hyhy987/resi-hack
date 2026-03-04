"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { SwapTimeline } from "@/components/swaps/SwapTimeline";
import { SwapActions } from "@/components/swaps/SwapActions";
import { SwapMessages } from "@/components/swaps/SwapMessages";
import { Badge, statusColor } from "@/components/ui/Badge";
import { SwapData } from "@/types";
import Link from "next/link";

export default function SwapDetailPage() {
  const params = useParams();
  const id = params.id as string;
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
        <div className="text-center py-20 text-[var(--text-muted)] animate-fade-in">Swap not found</div>
      </PageContainer>
    );
  }

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

      <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold font-[Outfit] text-[var(--text-primary)] tracking-tight">
          Swap Details
        </h1>
        <Badge color={statusColor(swap.status)}>{swap.status}</Badge>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Left: Timeline */}
        <div className="lg:w-1/3">
          <div className="glass-card-static p-6 animate-fade-in-up stagger-1">
            <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-5 font-[Outfit]">
              Progress
            </h2>
            <SwapTimeline swap={swap} />
          </div>
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
