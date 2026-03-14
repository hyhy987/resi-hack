"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
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
    setLoading(true);
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
        <h1 className="text-4xl font-extrabold font-[Outfit] text-[var(--text-primary)] tracking-tight mb-2">
          Marketplace
        </h1>
        <p className="text-[var(--text-secondary)]">
          Browse credit offers and requests from fellow NUS residents. Click any
          listing to see details and make an offer. Listings expire after{" "}
          {EXPIRY_HOURS} hours.
        </p>
      </div>

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
            + New Listing
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
        emptyMessage={
          activeTab === "mine"
            ? "You haven't created any listings"
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
            <div className="h-10 w-48 bg-[var(--bg-elevated)] rounded mb-2" />
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
