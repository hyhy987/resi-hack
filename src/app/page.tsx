"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { ListingsGrid } from "@/components/listings/ListingsGrid";
import { CreateListingModal } from "@/components/listings/CreateListingModal";
import { CreditTypeFilter } from "@/components/listings/CreditTypeFilter";
import { useAuth } from "@/providers/AuthProvider";
import { ListingData } from "@/types";
import { EXPIRY_HOURS } from "@/lib/constants";

const tabs = [
  { key: "OFFER", label: "Offers" },
  { key: "REQUEST", label: "Requests" },
  { key: "mine", label: "My Listings" },
];

type CreditTypeFilterValue = "all" | "BREAKFAST" | "DINNER";
type SortValue = "newest" | "expiring";

function StatsBar({ listings, loading, activeTab }: { listings: ListingData[]; loading: boolean; activeTab: string }) {
  const stats = useMemo(() => {
    if (loading || !listings.length) return null;
    const activeListings = listings.filter((l) => l.status === "ACTIVE");
    const offers = activeListings.filter((l) => l.type === "OFFER");
    const requests = activeListings.filter((l) => l.type === "REQUEST");
    const totalCredits = activeListings.reduce((sum, l) => sum + l.amount, 0);
    return {
      offers: offers.length,
      requests: requests.length,
      totalCredits,
      total: activeListings.length,
    };
  }, [listings, loading]);

  if (!stats) return null;

  return (
    <div className="flex items-center gap-4 mb-6 animate-fade-in-up stagger-1">
      {(activeTab === "mine" || activeTab === "OFFER") && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--offer-green-bg)] border border-[var(--offer-green)]/15">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--offer-green)]" />
          <span className="text-[11px] font-bold font-[Outfit] text-[var(--offer-green)]">
            {stats.offers} active offer{stats.offers !== 1 ? "s" : ""}
          </span>
        </div>
      )}
      {(activeTab === "mine" || activeTab === "REQUEST") && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--request-blue-bg)] border border-[var(--request-blue)]/15">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--request-blue)]" />
          <span className="text-[11px] font-bold font-[Outfit] text-[var(--request-blue)]">
            {stats.requests} active request{stats.requests !== 1 ? "s" : ""}
          </span>
        </div>
      )}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <span className="text-[11px] font-bold font-[Outfit] text-[var(--text-secondary)]">
          {stats.totalCredits} credits listed
        </span>
      </div>
    </div>
  );
}

function ListingsPageContent() {
  const { currentUser } = useAuth();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState("OFFER");

  useEffect(() => {
    if (
      tabFromUrl === "REQUEST" ||
      tabFromUrl === "mine" ||
      tabFromUrl === "OFFER"
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);
  const [creditType, setCreditType] = useState<CreditTypeFilterValue>("all");
  const [sort, setSort] = useState<SortValue>("newest");
  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchListings = useCallback(async () => {
    // Don't fetch "My Listings" until user is loaded to avoid showing all marketplace listings
    if (activeTab === "mine" && !currentUser) {
      setListings([]);
      setLoading(false);
      return;
    }
    // Only show loading skeletons on initial load, not on tab switches
    if (listings.length === 0) setLoading(true);
    const params = new URLSearchParams();
    if (activeTab === "mine" && currentUser) {
      params.set("userId", currentUser.id);
    } else if (activeTab !== "mine") {
      params.set("type", activeTab);
    }
    if (creditType !== "all") {
      params.set("creditType", creditType);
    }
    if (sort === "expiring") {
      params.set("sort", "expiring");
    }
    const url = `/api/listings?${params.toString()}`;
    const res = await fetch(url);
    const data = await res.json();
    setListings(data);
    setLoading(false);
  }, [activeTab, creditType, sort, currentUser]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return (
    <PageContainer>
      {/* Hero section */}
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl font-extrabold font-[Outfit] tracking-tight mb-3">
          <span className="text-gradient">Marketplace</span>
        </h1>
        <p className="text-[var(--text-secondary)] max-w-xl">
          Browse credit offers and requests from fellow NUS residents. Click any
          listing to see details and make an offer. Listings expire after{" "}
          {EXPIRY_HOURS} hours.
        </p>
      </div>

      {/* Stats summary */}
      <StatsBar listings={listings} loading={loading} activeTab={activeTab} />

      {/* Controls bar */}
      <div className="flex flex-col gap-4 mb-6 animate-fade-in-up stagger-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Tabs
            tabs={tabs.map((t) => ({
              ...t,
              count: activeTab === t.key && !loading ? listings.length : undefined,
            }))}
            active={activeTab}
            onChange={setActiveTab}
          />
          <Button
            onClick={() => setShowCreate(true)}
            disabled={!currentUser}
            size="md"
          >
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Listing
            </span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <CreditTypeFilter value={creditType} onChange={setCreditType} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortValue)}
            className="text-xs font-bold font-[Outfit] px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="expiring">Expiring soon</option>
          </select>
        </div>
      </div>

      {/* Listings */}
      <ListingsGrid
        listings={listings}
        loading={loading}
        fromTab={activeTab}
        onCreateClick={() => setShowCreate(true)}
        canCreate={!!currentUser}
        emptyMessage={
          activeTab === "mine"
            ? "You haven't created any listings yet"
            : activeTab === "OFFER"
              ? "No offers in your Dining Hall yet"
              : "No requests in your Dining Hall yet"
        }
      />

      <CreateListingModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchListings}
      />
    </PageContainer>
  );
}

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="mb-10 animate-pulse">
            <div className="h-12 w-56 bg-[var(--bg-elevated)] rounded-xl mb-3" />
            <div className="h-5 w-96 bg-[var(--bg-elevated)] rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="glass-card p-4 animate-pulse h-48 rounded-xl"
              />
            ))}
          </div>
        </PageContainer>
      }
    >
      <ListingsPageContent />
    </Suspense>
  );
}
