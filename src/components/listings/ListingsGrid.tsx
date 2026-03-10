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
}

export function ListingsGrid({ listings = [] }: ListingsGridProps) {
  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="text-4xl mb-3 opacity-20">{"\u2727"}</div>
        <p className="text-[var(--text-muted)] font-[Outfit] tracking-wide">
          No listings found in your Hall
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map((listing, index) => (
        <ListingCard key={listing.id} listing={listing} index={index} />
      ))}
    </div>
  );
}
