"use client";

import Link from "next/link";
import { ListingData } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/providers/AuthProvider";

interface Props {
  listings: ListingData[];
}

export function ListingsGrid({ listings }: Props) {
  const { currentUser } = useAuth();

  const formatExpiry = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (listings.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3 opacity-30">
          {"\u2727"}
        </div>
        <p className="text-[var(--text-muted)] font-[Outfit]">No listings found</p>
        <p className="text-[var(--text-muted)] text-sm mt-1">Be the first to create one</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map((l, i) => {
        const isOffer = l.type === "OFFER";
        const isMine = currentUser?.id === l.userId;

        return (
          <Link
            key={l.id}
            href={`/listing/${l.id}`}
            className={`glass-card p-5 block group animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <Badge color={isOffer ? "green" : "blue"}>
                {isOffer ? "OFFERING" : "REQUESTING"}
              </Badge>
              {isMine && (
                <Badge color="accent">YOU</Badge>
              )}
            </div>

            <div className="mb-4">
              <span className={`text-3xl font-bold font-[Outfit] ${
                isOffer ? "text-[var(--offer-green)]" : "text-[var(--request-blue)]"
              }`}>
                {l.amount}
              </span>
              <span className="text-[var(--text-muted)] text-sm ml-1.5">credits</span>
            </div>

            {l.notes && (
              <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 leading-relaxed">
                {l.notes}
              </p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-[Outfit] ${
                  isOffer
                    ? "bg-[var(--offer-green-bg)] text-[var(--offer-green)]"
                    : "bg-[var(--request-blue-bg)] text-[var(--request-blue)]"
                }`}>
                  {l.user.name.charAt(0)}
                </div>
                <span className="text-xs text-[var(--text-secondary)]">{l.user.name}</span>
              </div>
              <span className="text-xs text-[var(--text-muted)]">
                {l.status === "ACTIVE" ? formatExpiry(l.expiresAt) : l.status.toLowerCase()}
              </span>
            </div>

            <div className="mt-3 text-xs text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity font-[Outfit] font-medium">
              View details &rarr;
            </div>
          </Link>
        );
      })}
    </div>
  );
}
