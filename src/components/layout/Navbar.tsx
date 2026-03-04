"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { currentUser, allUsers, switchUser, loading } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path
      ? "text-[var(--accent)] font-medium"
      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]";

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 backdrop-blur-xl animate-slide-down">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[#c76a52] flex items-center justify-center text-white font-bold text-sm font-[Outfit] shadow-lg shadow-[var(--accent-glow)] group-hover:shadow-xl transition-shadow">
              CS
            </div>
            <span className="text-lg font-bold font-[Outfit] text-[var(--text-primary)] tracking-tight">
              CreditSwap
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive("/")}`}
            >
              Marketplace
            </Link>
            <Link
              href="/profile"
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive("/profile")}`}
            >
              Profile
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent)]/20">
              <span className="text-xs text-[var(--text-secondary)]">Credits</span>
              <span className="text-sm font-bold font-[Outfit] text-[var(--accent)]">
                {currentUser.trackedCredits}
              </span>
            </div>
          )}

          <select
            value={currentUser?.id || ""}
            onChange={(e) => switchUser(e.target.value)}
            disabled={loading}
            className="text-sm !rounded-xl !px-3 !py-1.5 !bg-[var(--bg-surface)] !border-[var(--border)] cursor-pointer min-w-[140px]"
          >
            {!currentUser && <option value="">Select user</option>}
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
}
