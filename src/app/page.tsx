"use client";

import { useEffect, useState, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { ListingsTable } from "@/components/listings/ListingsTable";
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
      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 shrink-0 hidden lg:block">
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <h2 className="font-semibold text-gray-900">Quick Actions</h2>
            <Button
              className="w-full"
              onClick={() => setShowCreate(true)}
              disabled={!currentUser}
            >
              + Create Listing
            </Button>

            {currentUser && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">Your Credits</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {currentUser.trackedCredits}
                </p>
              </div>
            )}

            {!currentUser && (
              <p className="text-xs text-gray-400">
                Select a user from the navbar to get started.
              </p>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
            <Button
              className="lg:hidden"
              size="sm"
              onClick={() => setShowCreate(true)}
              disabled={!currentUser}
            >
              + Create
            </Button>
          </div>

          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : (
            <ListingsTable listings={listings} onRefresh={fetchListings} />
          )}
        </div>
      </div>

      <CreateListingModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchListings}
      />
    </PageContainer>
  );
}
