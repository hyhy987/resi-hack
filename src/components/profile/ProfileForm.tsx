"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";

export function ProfileForm() {
  const { currentUser, refreshUser } = useAuth();
  const [name, setName] = useState(currentUser?.name || "");
  const [contactHandle, setContactHandle] = useState(
    currentUser?.contactHandle || ""
  );
  const [trackedCredits, setTrackedCredits] = useState(
    String(currentUser?.trackedCredits || 0)
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (!currentUser) {
    return <p className="text-[var(--text-muted)]">Please select a user first.</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        contactHandle,
        trackedCredits: Number(trackedCredits),
      }),
    });

    if (res.ok) {
      setMessage("Profile updated!");
      await refreshUser();
    } else {
      setMessage("Failed to update profile.");
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 font-[Outfit]">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 font-[Outfit]">
          Telegram Handle
        </label>
        <input
          type="text"
          value={contactHandle}
          onChange={(e) => setContactHandle(e.target.value)}
          className="w-full px-3 py-2 text-sm"
          placeholder="@your_handle"
        />
        <p className="text-xs text-[var(--text-muted)] mt-1.5">
          Visible to others on your listings so they can contact you.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 font-[Outfit]">
          Tracked Credits <span className="normal-case font-normal">(0-99)</span>
        </label>
        <input
          type="number"
          min="0"
          max="99"
          value={trackedCredits}
          onChange={(e) => setTrackedCredits(e.target.value)}
          className="w-full px-3 py-2 text-sm"
        />
      </div>

      {message && (
        <p
          className={`text-sm p-2 rounded-lg ${
            message.includes("updated")
              ? "text-[var(--success)] bg-[var(--success)]/10"
              : "text-[var(--danger)] bg-[var(--danger)]/10"
          }`}
        >
          {message}
        </p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
