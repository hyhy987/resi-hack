"use client";

import { useState } from "react";
import { SwapData } from "@/types";

interface Props {
  swap: SwapData;
  partner: {
    name: string;
    nusId?: string;
  };
}

export function SwapInstructions({ swap, partner }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!partner.nusId) return;
    navigator.clipboard.writeText(partner.nusId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card-static p-6 border-l-4 border-l-[var(--accent)] animate-fade-in-up h-full flex flex-col justify-center">
      <h2 className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-[0.2em] mb-6 font-[Outfit]">
        Transfer Instructions
      </h2>

      <div className="space-y-5 text-[11px] leading-relaxed text-[var(--text-secondary)] font-medium">
        <div className="flex gap-3">
          <span className="opacity-40">01</span>
          <p>
            Open{" "}
            <span className="text-[var(--text-primary)] font-bold">
              NUS Dining Hall
            </span>{" "}
            app
          </p>
        </div>

        <div className="flex gap-3">
          <span className="opacity-40">02</span>
          <p>
            Tap{" "}
            <span className="text-[var(--text-primary)] font-bold">
              Transfer Credits
            </span>{" "}
            (circle icon, top-left)
          </p>
        </div>

        {/* NUS ID Box with Copy Logic */}
        <button
          onClick={handleCopy}
          className="w-full p-3 bg-[var(--bg-input)] rounded-xl border border-[var(--border-subtle)] group relative text-left transition-all hover:border-[var(--accent)]/50 active:scale-[0.98]"
        >
          <p className="text-[9px] text-[var(--text-muted)] mb-1 uppercase tracking-tighter">
            Recipient NUS ID
          </p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-mono font-bold text-[var(--accent)]">
              {partner.nusId || "E-------"}
            </p>
            <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">
              {copied ? "Saved!" : "Copy"}
            </span>
          </div>
        </button>

        <div className="flex gap-3">
          <span className="opacity-40">03</span>
          <p>
            Transfer exactly:
            <span className="block mt-1 text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">
              {swap.amount} {swap.listing.creditType.toLowerCase()}{" "}
              {swap.amount === 1 ? "credit" : "credits"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
