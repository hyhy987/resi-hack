"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { HistoryEntry } from "@/types";
import Link from "next/link";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalGave = history
    .filter((h) => h.type === "GAVE")
    .reduce((sum, h) => sum + h.amount, 0);
  const totalReceived = history
    .filter((h) => h.type === "RECEIVED")
    .reduce((sum, h) => sum + h.amount, 0);

  return (
    <PageContainer>
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl font-extrabold font-[Outfit] tracking-tight mb-3">
          <span className="text-gradient">Transaction History</span>
        </h1>
        <p className="text-[var(--text-secondary)] max-w-xl">
          A complete record of all your completed credit swaps.
        </p>
      </div>

      {/* Summary cards */}
      {!loading && history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-in-up stagger-1">
          <div className="glass-card-static p-5">
            <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-2">
              Total Swaps
            </p>
            <p className="text-3xl font-black font-[Outfit] text-[var(--text-primary)]">
              {history.length}
            </p>
          </div>
          <div className="glass-card-static p-5">
            <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-2">
              Credits Given
            </p>
            <p className="text-3xl font-black font-[Outfit] text-[var(--danger)]">
              -{totalGave}
            </p>
          </div>
          <div className="glass-card-static p-5">
            <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-2">
              Credits Received
            </p>
            <p className="text-3xl font-black font-[Outfit] text-[var(--success)]">
              +{totalReceived}
            </p>
          </div>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card-static p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)]" />
                <div className="flex-1">
                  <div className="h-4 w-48 rounded bg-[var(--bg-elevated)] mb-2" />
                  <div className="h-3 w-32 rounded bg-[var(--bg-elevated)]" />
                </div>
                <div className="h-6 w-16 rounded bg-[var(--bg-elevated)]" />
              </div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-40">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p className="text-[var(--text-muted)] font-[Outfit] text-lg mb-2">
            No transactions yet
          </p>
          <p className="text-sm text-[var(--text-muted)] opacity-60 mb-4">
            Complete your first swap to see it here.
          </p>
          <Link href="/">
            <button className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold font-[Outfit] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer">
              Browse Marketplace
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in-up stagger-2">
          {history.map((entry, index) => {
            const isGave = entry.type === "GAVE";
            return (
              <Link
                key={entry.id}
                href={`/swap/${entry.swapId}`}
                className="glass-card p-5 flex items-center gap-4"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* Direction icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isGave
                      ? "bg-[var(--danger)]/10 text-[var(--danger)]"
                      : "bg-[var(--success)]/10 text-[var(--success)]"
                  }`}
                >
                  {isGave ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <polyline points="19 12 12 19 5 12" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="19" x2="12" y2="5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold font-[Outfit] text-[var(--text-primary)]">
                    {isGave ? "Gave" : "Received"} {entry.amount}{" "}
                    {entry.creditType.toLowerCase()}{" "}
                    {entry.amount === 1 ? "credit" : "credits"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {isGave ? "to" : "from"}{" "}
                    <span className="text-[var(--text-secondary)]">
                      {entry.counterpartyName}
                    </span>{" "}
                    &middot; {timeAgo(entry.completedAt)}
                  </p>
                </div>

                {/* Amount badge */}
                <div
                  className={`text-lg font-black font-[Outfit] flex-shrink-0 ${
                    isGave ? "text-[var(--danger)]" : "text-[var(--success)]"
                  }`}
                >
                  {isGave ? "-" : "+"}
                  {entry.amount}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
