"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { currentUser, logout, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[#c76a52] flex items-center justify-center text-white font-bold text-sm font-[Outfit] shadow-lg shadow-[var(--accent-glow)] group-hover:shadow-xl transition-shadow">
              CS
            </div>
            <span className="text-lg font-bold font-[Outfit] text-[var(--text-primary)] tracking-tight">
              CreditSwap
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <span className="text-[10px]" title="Breakfast">
                  Breakfast:
                </span>
                <span className="text-xs font-bold font-[Outfit] text-[var(--text-primary)]">
                  {currentUser.breakfastCredits || 0}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <span className="text-[10px]" title="Dinner">
                  Dinner:
                </span>
                <span className="text-xs font-bold font-[Outfit] text-[var(--text-primary)]">
                  {currentUser.dinnerCredits || 0}
                </span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="w-24 h-9 rounded-xl bg-[var(--bg-surface)] animate-pulse" />
          ) : currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="!py-1.5"
              >
                {currentUser.name}
              </Button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 py-1 min-w-[140px] rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-lg animate-fade-in z-50">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                  >
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
