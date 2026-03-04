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
    return <p className="text-gray-500">Please select a user first.</p>;
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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact Handle
        </label>
        <input
          type="text"
          value={contactHandle}
          onChange={(e) => setContactHandle(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tracked Credits (0-99)
        </label>
        <input
          type="number"
          min="0"
          max="99"
          value={trackedCredits}
          onChange={(e) => setTrackedCredits(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.includes("updated") ? "text-green-600" : "text-red-600"
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
