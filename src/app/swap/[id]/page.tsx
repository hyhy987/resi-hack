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
        <div className="text-center py-12 text-gray-400">Loading...</div>
      </PageContainer>
    );
  }

  if (!swap) {
    return (
      <PageContainer>
        <div className="text-center py-12 text-gray-500">Swap not found</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href="/" className="text-sm text-indigo-600 hover:underline">
          &larr; Back to Listings
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Swap Details</h1>
        <Badge color={statusColor(swap.status)}>{swap.status}</Badge>
      </div>

      <div className="flex gap-8 flex-col lg:flex-row">
        {/* Left: Timeline */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Status</h2>
            <SwapTimeline swap={swap} />
          </div>
        </div>

        {/* Right: Actions + Messages */}
        <div className="lg:w-2/3 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Actions</h2>
            <SwapActions swap={swap} onRefresh={fetchSwap} />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
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
