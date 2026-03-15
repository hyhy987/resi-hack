"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { NotificationBell } from "@/components/notifications/NotificationBell";

function SunriseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4" />
      <path d="m4.93 10.93 1.41 1.41" />
      <path d="M2 18h2" />
      <path d="M20 18h2" />
      <path d="m19.07 10.93-1.41 1.41" />
      <path d="M22 22H2" />
      <path d="M16 18a4 4 0 0 0-8 0" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function Navbar() {
  const { currentUser, logout, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 backdrop-blur-xl animate-slide-down">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[#c76a52] flex items-center justify-center text-white font-bold text-sm font-[Outfit] shadow-lg shadow-[var(--accent-glow)] group-hover:shadow-xl group-hover:scale-105 transition-all duration-200">
              CS
            </div>
            <span className="text-lg font-bold font-[Outfit] text-[var(--text-primary)] tracking-tight">
              CreditSwap
            </span>
          </Link>

          {/* Active page indicator */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-[Outfit] transition-all duration-200 ${
                  pathname === "/"
                    ? "text-[var(--accent)] bg-[var(--accent)]/10"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                Marketplace
              </Link>
              <Link
                href="/history"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-[Outfit] transition-all duration-200 ${
                  pathname === "/history"
                    ? "text-[var(--accent)] bg-[var(--accent)]/10"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                History
              </Link>
              <Link
                href="/analytics"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-[Outfit] transition-all duration-200 ${
                  pathname === "/analytics"
                    ? "text-[var(--accent)] bg-[var(--accent)]/10"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                Analytics
              </Link>
              <Link
                href="/profile"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-[Outfit] transition-all duration-200 ${
                  pathname === "/profile"
                    ? "text-[var(--accent)] bg-[var(--accent)]/10"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                Profile
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] group hover:border-[var(--border)] transition-colors">
                <span className="text-[var(--warning)] opacity-70 group-hover:opacity-100 transition-opacity">
                  <SunriseIcon />
                </span>
                <AnimatedNumber
                  value={currentUser.breakfastCredits || 0}
                  className="text-xs font-bold font-[Outfit] text-[var(--text-primary)]"
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] group hover:border-[var(--border)] transition-colors">
                <span className="text-[var(--request-blue)] opacity-70 group-hover:opacity-100 transition-opacity">
                  <MoonIcon />
                </span>
                <AnimatedNumber
                  value={currentUser.dinnerCredits || 0}
                  className="text-xs font-bold font-[Outfit] text-[var(--text-primary)]"
                />
              </div>
            </div>
          )}

          {currentUser && <NotificationBell />}

          {loading ? (
            <div className="w-24 h-9 rounded-xl bg-[var(--bg-surface)] animate-pulse" />
          ) : currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-medium font-[Outfit] hover:bg-[var(--accent-hover)] shadow-lg shadow-[var(--accent-glow)] transition-all cursor-pointer active:scale-[0.97]"
              >
                <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                {currentUser.name}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 py-1.5 min-w-[160px] rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xl shadow-black/30 animate-fade-in z-50">
                  {/* Mobile credit display */}
                  <div className="md:hidden px-4 py-2.5 border-b border-[var(--border-subtle)] mb-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                        <SunriseIcon /> Breakfast
                      </span>
                      <span className="font-bold font-[Outfit] text-[var(--text-primary)]">
                        {currentUser.breakfastCredits || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1.5">
                      <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                        <MoonIcon /> Dinner
                      </span>
                      <span className="font-bold font-[Outfit] text-[var(--text-primary)]">
                        {currentUser.dinnerCredits || 0}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    <UserIcon />
                    Profile
                  </Link>
                  <Link
                    href="/history"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    History
                  </Link>
                  <Link
                    href="/analytics"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    Analytics
                  </Link>
                  <div className="mx-3 my-1 border-t border-[var(--border-subtle)]" />
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/5 transition-colors cursor-pointer"
                  >
                    <LogOutIcon />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm">
                Log in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
