"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { DINING_HALLS } from "@/lib/constants";
import { useAuth } from "@/providers/AuthProvider";

export default function SignupPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [nusId, setNusId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [diningHall, setDiningHall] = useState("RVRC");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nusId: nusId.toUpperCase().trim(),
          password,
          name: name.trim(),
          diningHall,
        }),
      });

      let data: { error?: string };
      try {
        data = await res.json();
      } catch {
        setError(res.ok ? "Invalid response from server" : "Sign up failed. Please try again.");
        return;
      }

      if (res.ok) {
        await refreshUser();
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Sign up failed");
      }
    } catch (err) {
      setError("A network error occurred. Is the server running?");
      console.error("Signup fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="glass-card-static p-8">
            <h1 className="text-2xl font-bold font-[Outfit] text-[var(--text-primary)] tracking-tight mb-2">
              Create account
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Sign up with your NUSNET ID to start swapping credits
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest ml-1">
                  NUSNET ID
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

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest ml-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] p-3 rounded-xl focus:border-[var(--accent)] outline-none transition-all text-sm"
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest ml-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] p-3 rounded-xl focus:border-[var(--accent)] outline-none transition-all text-sm"
                  required
                />
              </div>

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

              {error && (
                <div className="text-xs p-3 rounded-xl border animate-fade-in text-[var(--danger)] bg-[var(--danger)]/10 border-[var(--danger)]/20">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full py-3 text-sm font-bold uppercase tracking-widest"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Sign up"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
