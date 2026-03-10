"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { DINING_HALLS } from "@/lib/constants";

export function ProfileForm() {
  const { currentUser, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [nusId, setNusId] = useState("");
  const [diningHall, setDiningHall] = useState("RVRC");
  const [contactHandle, setContactHandle] = useState("");
  const [trackedCredits, setTrackedCredits] = useState("0");

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  // NEW: State for Custom Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSwapCount, setPendingSwapCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setNusId((currentUser as any).nusId || "");
      setDiningHall(currentUser.diningHall || "RVRC");
      setContactHandle(currentUser.contactHandle || "");
      setTrackedCredits(String(currentUser.trackedCredits || 0));
    }
  }, [currentUser]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleSubmit = async (e?: React.FormEvent, confirmReset = false) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError("");
    setShowSuccess(false);
    setShowConfirmModal(false); // Close modal if it was open

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nusId: nusId.toUpperCase(),
          diningHall,
          contactHandle,
          trackedCredits: Number(trackedCredits),
          confirmReset,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowSuccess(true);
        await refreshUser();
      } else if (res.status === 409 && data.error === "ACTIVE_SWAPS_FOUND") {
        setPendingSwapCount(data.count);
        setShowConfirmModal(true);
      } else {
        setError(data.error || "Failed to update profile.");
      }
    } catch (err) {
      setError("A network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest ml-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] p-3 rounded-xl focus:border-[var(--accent)] outline-none transition-all text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest ml-1">
              NUS ID (E-number)
            </label>
            <input
              type="text"
              placeholder="E1234567"
              value={nusId}
              onChange={(e) => setNusId(e.target.value.toUpperCase())}
              maxLength={8}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] p-3 rounded-xl focus:border-[var(--accent)] outline-none transition-all font-mono text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest ml-1">
              Dining Hall
            </label>
            <div className="relative group">
              <select
                value={diningHall}
                onChange={(e) => setDiningHall(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] p-3 pr-10 rounded-xl focus:border-[var(--accent)] outline-none transition-all text-sm appearance-none cursor-pointer"
              >
                {DINING_HALLS.map((hall) => (
                  <option key={hall} value={hall}>
                    {hall}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest ml-1">
              Tracked Credits (0-200)
            </label>
            <input
              type="number"
              min="0"
              max="200"
              value={trackedCredits}
              onChange={(e) => setTrackedCredits(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] p-3 rounded-xl focus:border-[var(--accent)] outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest ml-1">
            Telegram Handle
          </label>
          <input
            type="text"
            value={contactHandle}
            onChange={(e) => setContactHandle(e.target.value)}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] p-3 rounded-xl focus:border-[var(--accent)] outline-none transition-all text-sm"
            placeholder="@your_handle"
          />
        </div>

        {error && (
          <div className="text-xs p-3 rounded-xl border animate-fade-in text-[var(--danger)] bg-[var(--danger)]/10 border-[var(--danger)]/20">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className={`w-full py-6 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${showSuccess ? "bg-[var(--offer-green)] hover:bg-[var(--offer-green)] border-[var(--offer-green)]" : ""}`}
          disabled={saving}
        >
          {saving
            ? "Processing..."
            : showSuccess
              ? "Updated!"
              : "Update Profile"}
        </Button>
      </form>

      {/* --- CUSTOM CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          />

          {/* Modal Card */}
          <div className="relative glass-card-static w-full max-w-md p-8 animate-zoom-in">
            <div className="mb-6 text-center">
              <div className="w-16 h-16 bg-[var(--danger)]/10 text-[var(--danger)] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m10.27 2.18-8 14c-.3.52-.3 1.15 0 1.66.3.52.88.84 1.5.84h16.44c.62 0 1.2-.32 1.5-.84.3-.51.3-1.14 0-1.66l-8-14c-.3-.52-.88-.84-1.5-.84s-1.2.32-1.5.84Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-[Outfit] text-[var(--text-primary)] mb-2">
                Active Swaps Found
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                You have{" "}
                <span className="text-[var(--text-primary)] font-bold">
                  {pendingSwapCount}
                </span>{" "}
                incomplete transaction(s). Changing your Residential College
                will revert these swaps and notify counterparties.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="danger"
                className="w-full py-4 text-xs font-bold uppercase tracking-widest bg-[var(--danger)] hover:bg-[var(--danger)]/80"
                onClick={() => handleSubmit(undefined, true)}
              >
                Confirm & Revert Swaps
              </Button>
              <Button
                variant="secondary"
                className="w-full py-4 text-xs font-bold uppercase tracking-widest border border-[var(--border-subtle)]"
                onClick={() => setShowConfirmModal(false)}
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
