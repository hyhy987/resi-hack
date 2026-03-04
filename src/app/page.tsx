"use client";

import { useEffect, useState, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { ListingsGrid } from "@/components/listings/ListingsGrid";
import { CreateListingModal } from "@/components/listings/CreateListingModal";
import { useAuth } from "@/providers/AuthProvider";
import { ListingData } from "@/types";

const tabs = [
  { key: "OFFER", label: "Offers" },
  { key: "REQUEST", label: "Requests" },
  { key: "mine", label: "My Listings" },
];

export default function ListingsPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("OFFER");
  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    let url = "/api/listings";
    if (activeTab === "mine" && currentUser) {
      url += `?userId=${currentUser.id}`;
    } else if (activeTab !== "mine") {
      url += `?type=${activeTab}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    setListings(data);
    setLoading(false);
  }, [activeTab, currentUser]);

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
        <p className="text-[var(--text-secondary)] max-w-lg">
          Browse credit offers and requests from fellow NUS residents. Click any listing to see details and make an offer.
        </p>
      </div>

      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-fade-in-up stagger-2">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <Button
          onClick={() => setShowCreate(true)}
          disabled={!currentUser}
          size="md"
        >
          + New Listing
        </Button>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-block w-6 h-6 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
      ) : (
        <ListingsGrid listings={listings} />
      )}

      <CreateListingModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchListings}
      />
    </PageContainer>
  );
}
