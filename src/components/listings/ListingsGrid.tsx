"use client";

import React from "react";
import { ListingCard } from "./ListingCard";
import { ListingData, SwapData } from "@/types";
import { Button } from "@/components/ui/Button";

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
  onCreateClick?: () => void;
  canCreate?: boolean;
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

function EmptyStateIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mx-auto mb-6 opacity-30">
      {/* Stylized empty box / marketplace */}
      <rect x="20" y="35" width="80" height="60" rx="8" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="6 4" />
      <path d="M20 55h80" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 3" />
      <circle cx="45" cy="75" r="8" stroke="var(--offer-green)" strokeWidth="1.5" opacity="0.5" />
      <circle cx="75" cy="75" r="8" stroke="var(--request-blue)" strokeWidth="1.5" opacity="0.5" />
      <path d="M55 28l5-8 5 8" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <line x1="60" y1="28" x2="60" y2="35" stroke="var(--accent)" strokeWidth="2" opacity="0.6" />
    </svg>
  );
}

export function ListingsGrid({
  listings = [],
  loading = false,
  fromTab = "OFFER",
  emptyMessage = "No listings found in your Dining Hall",
  onCreateClick,
  canCreate = false,
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
      <div className="text-center py-16 animate-fade-in">
        <EmptyStateIllustration />
        <p className="text-[var(--text-muted)] font-[Outfit] tracking-wide text-lg mb-2">
          {emptyMessage}
        </p>
        <p className="text-sm text-[var(--text-muted)] opacity-60 mb-6 max-w-xs mx-auto">
          {fromTab === "mine"
            ? "Create your first listing to start swapping credits with others."
            : "Be the first to post! Create a listing and others will find it."}
        </p>
        {onCreateClick && canCreate && (
          <Button onClick={onCreateClick} size="md">
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Listing
            </span>
          </Button>
        )}
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
