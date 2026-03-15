"use client";

import Link from "next/link";
import { ListingData, SwapData, SwapStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/providers/AuthProvider";
import {
  formatExpiry,
  hoursUntilExpiry,
} from "@/lib/format";

interface ListingCardProps {
  listing: ListingData & {
    swaps?: (SwapData & {
      proposer: { name: string };
      counterparty: { name: string };
    })[];
  };
  index: number;
  fromTab?: string;
}

const EXPIRY_URGENT_HOURS = 6;

export function ListingCard({
  listing,
  index,
  fromTab = "OFFER",
}: ListingCardProps) {
  const { currentUser } = useAuth();
  const l = listing;
  const hoursLeft = hoursUntilExpiry(l.expiresAt);
  const isExpiryUrgent =
    l.status === "ACTIVE" && hoursLeft > 0 && hoursLeft < EXPIRY_URGENT_HOURS;

  const getSwapStatusLabel = (status: SwapStatus): string => {
    switch (status) {
      case "PROPOSED":
        return "Proposed";
      case "ACCEPTED":
        return "Accepted";
      case "CONFIRMED_BY_GIVER":
      case "CONFIRMED_BY_RECEIVER":
        return "Confirming";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return "";
    }
  };

  const isOffer = l.type === "OFFER";
  const isMine = currentUser?.id === l.userId;
  const mySwap = l.swaps?.length ? l.swaps[0] : null;
  const isActiveSwap =
    mySwap && !["COMPLETED", "CANCELLED"].includes(mySwap.status);
  const isProposer = !isMine && !!mySwap;

  let displayName = "";
  let showAvatar = false;
  if (mySwap) {
    if (isMine) {
      displayName = mySwap.proposer.name;
      showAvatar = true;
    } else if (isProposer && mySwap.status !== "PROPOSED") {
      displayName = mySwap.counterparty.name;
      showAvatar = true;
    }
  } else if (!isMine) {
    displayName = l.user.name;
    showAvatar = true;
  }

  let hasActionItem = false;
  if (mySwap && currentUser && isActiveSwap) {
    const isGiver =
      (l.type === "OFFER" && isMine) || (l.type === "REQUEST" && isProposer);
    const isReceiver =
      (l.type === "OFFER" && isProposer) || (l.type === "REQUEST" && isMine);
    if (
      mySwap.status === "PROPOSED" &&
      currentUser.id === mySwap.counterpartyId
    ) {
      hasActionItem = true;
    } else if (
      ["ACCEPTED", "CONFIRMED_BY_GIVER", "CONFIRMED_BY_RECEIVER"].includes(
        mySwap.status,
      )
    ) {
      if (
        (isGiver && !mySwap.giverConfirmed) ||
        (isReceiver && !mySwap.receiverConfirmed)
      ) {
        hasActionItem = true;
      }
    }
  }

  const statusLabel = mySwap ? getSwapStatusLabel(mySwap.status) : null;
  const href = isActiveSwap
    ? `/swap/${mySwap.id}`
    : `/listing/${l.id}?fromTab=${encodeURIComponent(fromTab)}`;

  const glowClass = isOffer ? "glow-green" : "glow-blue";

  return (
    <Link
      href={href}
      className={`glass-card shimmer-on-hover ${glowClass} p-4 flex flex-col group relative overflow-hidden transition-all duration-300 hover:border-[var(--accent)]/50 animate-fade-in-up stagger-${Math.min(index + 1, 8)} ${isMine ? "border-l-4 border-l-[var(--accent)]" : ""} ${hasActionItem ? "ring-1 ring-[var(--accent)]/40" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-1.5 flex-wrap">
          <Badge color={isOffer ? "green" : "blue"}>
            {isOffer ? "OFFERING" : "REQUESTING"}
          </Badge>
          {isMine && <Badge color="accent">OWNER</Badge>}
          <span
            className={`text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded border flex items-center gap-1 ${
              l.creditType === "BREAKFAST"
                ? "text-[var(--warning)] bg-[var(--warning)]/8 border-[var(--warning)]/15"
                : "text-[var(--request-blue)] bg-[var(--request-blue-bg)] border-[var(--request-blue)]/15"
            }`}
            title={l.creditType}
          >
            {l.creditType === "BREAKFAST" ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4" /><path d="m4.93 10.93 1.41 1.41" /><path d="M2 18h2" /><path d="M20 18h2" /><path d="m19.07 10.93-1.41 1.41" /><path d="M22 22H2" /><path d="M16 18a4 4 0 0 0-8 0" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
            {l.creditType === "BREAKFAST" ? "Breakfast" : "Dinner"}
          </span>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-3xl font-black font-[Outfit] tracking-tight ${isOffer ? "text-[var(--offer-green)]" : "text-[var(--request-blue)]"}`}
          >
            {l.amount}
          </span>
          <span className="text-[var(--text-primary)] text-[11px] font-bold uppercase tracking-tight">
            {l.creditType.toLowerCase()} {l.amount === 1 ? "credit" : "credits"}
          </span>
        </div>
      </div>

      <p className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-2 leading-snug min-h-[2.5rem]">
        {l.notes || (
          <span className="italic opacity-40">No notes provided</span>
        )}
      </p>

      <div className="mt-auto flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          {showAvatar && (
            <div
              className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold font-[Outfit] ${isOffer ? "bg-[var(--offer-green-bg)] text-[var(--offer-green)]" : "bg-[var(--request-blue-bg)] text-[var(--request-blue)]"}`}
            >
              {displayName.charAt(0)}
            </div>
          )}
          <span className="text-[11px] font-medium text-[var(--text-secondary)]">
            {displayName}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[9px] block text-[var(--text-muted)] uppercase font-bold tracking-tight">
            {statusLabel
              ? "Swap Stage"
              : l.status === "ACTIVE"
                ? "Expires"
                : "Status"}
          </span>
          <div className="flex items-center justify-end gap-1">
            {hasActionItem && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
                <span className="relative rounded-full h-1.5 w-1.5 bg-[var(--accent)]"></span>
              </span>
            )}
            <span
              className={`text-[11px] font-bold font-[Outfit] ${
                statusLabel
                  ? "text-[var(--accent)]"
                  : isExpiryUrgent
                    ? "text-[var(--warning)]"
                    : "text-[var(--text-primary)]"
              }`}
            >
              {statusLabel ||
                (l.status === "ACTIVE"
                  ? formatExpiry(l.expiresAt)
                  : l.status.toLowerCase())}
            </span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Link>
  );
}
