"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";

export function Navbar() {
  const { currentUser, allUsers, switchUser, loading } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            CreditSwap
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Listings
          </Link>
          <Link
            href="/profile"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Profile
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {currentUser && (
            <span className="text-sm text-gray-500">
              Credits: <span className="font-semibold text-gray-900">{currentUser.trackedCredits}</span>
            </span>
          )}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">User:</label>
            <select
              value={currentUser?.id || ""}
              onChange={(e) => switchUser(e.target.value)}
              disabled={loading}
              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
            >
              {!currentUser && <option value="">Select user</option>}
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.trackedCredits} cr)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
}
