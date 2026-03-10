"use client";

import Link from "next/link";
import { ListingData } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/providers/AuthProvider";

interface ExtendedListingData extends ListingData {
  swaps?: { id: string; status: string }[];
}

interface Props {
  listings: ExtendedListingData[];
}

export function ListingsGrid({ listings }: Props) {
  const { currentUser } = useAuth();

  const formatExpiry = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (listings.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3 opacity-30">{"\u2727"}</div>
        <p className="text-[var(--text-muted)] font-[Outfit]">
          No listings found
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map((l, i) => {
        const isOffer = l.type === "OFFER";
        const isMine = currentUser?.id === l.userId;

        // Only route to Swap Process if the swap is actually active/ongoing
        const mySwap = l.swaps?.length ? l.swaps[0] : null;
        const isActiveSwap =
          mySwap && !["COMPLETED", "CANCELLED"].includes(mySwap.status);
        const isProposer = !isMine && !!mySwap;

        const href =
          isProposer && isActiveSwap
            ? `/swap/${mySwap.id}`
            : `/listing/${l.id}`;

        return (
          <Link
            key={l.id}
            href={href}
            className={`glass-card p-5 block group relative overflow-hidden transition-all duration-300 hover:border-[var(--accent)]/50 animate-fade-in-up stagger-${Math.min(i + 1, 8)} ${isMine ? "border-l-4 border-l-[var(--accent)]" : ""}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex gap-2">
                <Badge color={isOffer ? "green" : "blue"}>
                  {isOffer ? "OFFERING" : "REQUESTING"}
                </Badge>
                {isMine && <Badge color="accent">OWNER</Badge>}
                {isProposer && <Badge color="purple">PROPOSED</Badge>}
              </div>

              {l.status !== "ACTIVE" && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {l.status}
                </span>
              )}
            </div>

            <div className="mb-3">
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-3xl font-black font-[Outfit] tracking-tight ${
                    isOffer
                      ? "text-[var(--offer-green)]"
                      : "text-[var(--request-blue)]"
                  }`}
                >
                  {l.amount}
                </span>
                <span className="text-[var(--text-muted)] text-[10px] font-bold uppercase">
                  credits
                </span>
              </div>
            </div>

            {/* Reduced min-height to tighten whitespace */}
            <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 leading-relaxed min-h-[1.25rem]">
              {l.notes || (
                <span className="italic opacity-50 text-xs">
                  No notes provided
                </span>
              )}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold font-[Outfit] ${
                    isOffer
                      ? "bg-[var(--offer-green-bg)] text-[var(--offer-green)]"
                      : "bg-[var(--request-blue-bg)] text-[var(--request-blue)]"
                  }`}
                >
                  {l.user.name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  {isMine ? "You" : l.user.name}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] block text-[var(--text-muted)] uppercase font-bold tracking-tighter">
                  {l.status === "ACTIVE" ? "Expires" : "Status"}
                </span>
                <span className="text-xs font-mono font-bold">
                  {l.status === "ACTIVE"
                    ? formatExpiry(l.expiresAt)
                    : l.status.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Tight hover indicator that doesn't push layout */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

            <div className="mt-3 overflow-hidden max-h-0 group-hover:max-h-10 transition-all duration-300 ease-in-out">
              <div className="pt-2 text-[10px] text-[var(--accent)] font-bold font-[Outfit] uppercase tracking-widest text-center">
                View Details →
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
