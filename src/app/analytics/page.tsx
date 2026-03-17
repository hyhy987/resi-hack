"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { DiningHallStats } from "@/types";

function StatCard({
  label,
  value,
  color = "var(--text-primary)",
  sub,
}: {
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
}) {
  return (
    <div className="glass-card-static p-5">
      <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-2">
        {label}
      </p>
      <p className="text-3xl font-black font-[Outfit]" style={{ color }}>
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-[var(--text-muted)] mt-1">{sub}</p>
      )}
    </div>
  );
}

function BarChart({
  data,
  label,
}: {
  data: { date: string; swaps: number }[];
  label: string;
}) {
  const max = Math.max(...data.map((d) => d.swaps), 1);

  return (
    <div className="glass-card-static p-6">
      <h3 className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-6 font-[Outfit]">
        {label}
      </h3>
      <div className="flex items-end gap-2 h-32">
        {data.map((d) => {
          const height = max > 0 ? (d.swaps / max) * 100 : 0;
          const dayLabel = new Date(d.date + "T00:00:00").toLocaleDateString(
            "en-US",
            { weekday: "short" }
          );
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-[var(--text-muted)]">
                {d.swaps > 0 ? d.swaps : ""}
              </span>
              <div
                className="w-full rounded-t-md bg-[var(--accent)] transition-all duration-500"
                style={{
                  height: `${Math.max(height, 4)}%`,
                  opacity: d.swaps > 0 ? 1 : 0.2,
                }}
              />
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase">
                {dayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SupplyDemandChart({
  breakfastOffers,
  dinnerOffers,
  breakfastRequests,
  dinnerRequests,
}: {
  breakfastOffers: number;
  dinnerOffers: number;
  breakfastRequests: number;
  dinnerRequests: number;
}) {
  const max = Math.max(breakfastOffers, dinnerOffers, breakfastRequests, dinnerRequests, 1);

  const bars = [
    { label: "Bkfst Offers", value: breakfastOffers, color: "var(--offer-green)" },
    { label: "Bkfst Requests", value: breakfastRequests, color: "var(--request-blue)" },
    { label: "Dinner Offers", value: dinnerOffers, color: "var(--offer-green)" },
    { label: "Dinner Requests", value: dinnerRequests, color: "var(--request-blue)" },
  ];

  return (
    <div className="glass-card-static p-6">
      <h3 className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-6 font-[Outfit]">
        Supply vs Demand
      </h3>
      <div className="space-y-3">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                {bar.label}
              </span>
              <span className="text-[11px] font-bold font-[Outfit]" style={{ color: bar.color }}>
                {bar.value}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-base)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${max > 0 ? (bar.value / max) * 100 : 0}%`,
                  backgroundColor: bar.color,
                  minWidth: bar.value > 0 ? "8px" : "0",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DiningHallStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="mb-10 animate-fade-in-up">
          <div className="h-12 w-56 bg-[var(--bg-elevated)] rounded-xl mb-3 animate-pulse" />
          <div className="h-5 w-96 bg-[var(--bg-elevated)] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card-static p-5 animate-pulse">
              <div className="h-3 w-20 bg-[var(--bg-elevated)] rounded mb-3" />
              <div className="h-8 w-12 bg-[var(--bg-elevated)] rounded" />
            </div>
          ))}
        </div>
      </PageContainer>
    );
  }

  if (!stats) {
    return (
      <PageContainer>
        <div className="text-center py-20">
          <p className="text-[var(--text-muted)]">Failed to load analytics</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl font-extrabold font-[Outfit] tracking-tight mb-3">
          <span className="text-gradient">Analytics</span>
        </h1>
        <p className="text-[var(--text-secondary)] max-w-xl">
          Real-time insights for{" "}
          <span className="text-[var(--text-primary)] font-bold">
            {stats.diningHall}
          </span>{" "}
          dining hall.
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-up stagger-1">
        <StatCard
          label="Active Offers"
          value={stats.activeOffers}
          color="var(--offer-green)"
        />
        <StatCard
          label="Active Requests"
          value={stats.activeRequests}
          color="var(--request-blue)"
        />
        <StatCard
          label="Credits Available"
          value={stats.totalActiveCredits}
          color="var(--warning)"
        />
        <StatCard
          label="Completed Swaps"
          value={stats.completedSwaps}
          color="var(--accent)"
          sub={`${stats.totalCreditsTraded} total credits traded`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in-up stagger-2">
        <BarChart data={stats.recentActivity} label="Swaps — Last 7 Days" />
        <SupplyDemandChart
          breakfastOffers={stats.breakfastOffers}
          dinnerOffers={stats.dinnerOffers}
          breakfastRequests={stats.breakfastRequests}
          dinnerRequests={stats.dinnerRequests}
        />
      </div>

      {/* Top traders */}
      {stats.topTraders.length > 0 && (
        <div className="glass-card-static p-6 animate-fade-in-up stagger-3">
          <h3 className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-6 font-[Outfit]">
            Top Traders
          </h3>
          <div className="space-y-3">
            {stats.topTraders.map((trader, i) => (
              <div
                key={trader.name}
                className="flex items-center gap-4"
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-[Outfit] ${
                    i === 0
                      ? "bg-[var(--warning)]/15 text-[var(--warning)]"
                      : i === 1
                        ? "bg-[var(--text-muted)]/10 text-[var(--text-muted)]"
                        : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                  }`}
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold font-[Outfit] text-[var(--text-primary)]">
                    {trader.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black font-[Outfit] text-[var(--accent)]">
                    {trader.swapCount}
                  </p>
                  <p className="text-[9px] text-[var(--text-muted)] uppercase">
                    swaps
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for no activity */}
      {stats.completedSwaps === 0 && stats.activeOffers === 0 && stats.activeRequests === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-40">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <p className="text-[var(--text-muted)] font-[Outfit] text-lg mb-2">
            No activity in {stats.diningHall} yet
          </p>
          <p className="text-sm text-[var(--text-muted)] opacity-60">
            Be the first to create a listing!
          </p>
        </div>
      )}
    </PageContainer>
  );
}
