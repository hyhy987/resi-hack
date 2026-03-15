"use client";

import React from "react";
import { ListingCard } from "./ListingCard";
import { ListingData, SwapData } from "@/types";

// Define the shape of the data including the nested names we added in the API
export type ListingWithSwaps = ListingData & {
  swaps?: (SwapData & {
    proposer: { name: string };
    counterparty: { name: string };
  })[];
};

interface ListingsGridProps {
  listings: ListingWithSwaps[];
  loading?: boolean;
  fromTab?: string;
  emptyMessage?: string;
}

function ListingCardSkeleton() {
  return (
    <div className="glass-card p-4 flex flex-col animate-pulse">
      <div className="flex gap-1.5 mb-3">
        <div className="h-5 w-20 rounded bg-[var(--bg-elevated)]" />
        <div className="h-5 w-14 rounded bg-[var(--bg-elevated)]" />
      </div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <div className="h-8 w-8 rounded bg-[var(--bg-elevated)]" />
        <div className="h-3 w-24 rounded bg-[var(--bg-elevated)]" />
      </div>
      <div className="space-y-1 mb-4">
        <div className="h-3 w-full rounded bg-[var(--bg-elevated)]" />
        <div className="h-3 w-3/4 rounded bg-[var(--bg-elevated)]" />
      </div>
      <div className="mt-auto flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
        <div className="h-3 w-16 rounded bg-[var(--bg-elevated)]" />
        <div className="h-3 w-12 rounded bg-[var(--bg-elevated)]" />
      </div>
    </div>
  );
}

export function ListingsGrid({
  listings = [],
  loading = false,
  fromTab = "OFFER",
  emptyMessage = "No listings found in your Dining Hall",
}: ListingsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="text-4xl mb-3 opacity-20">{"\u2727"}</div>
        <p className="text-[var(--text-muted)] font-[Outfit] tracking-wide">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map((listing, index) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          index={index}
          fromTab={fromTab}
        />
      ))}
    </div>
  );
}
