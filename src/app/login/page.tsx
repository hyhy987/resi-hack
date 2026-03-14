"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const redirect = searchParams.get("redirect") || "/";

  const [nusId, setNusId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nusId: nusId.toUpperCase().trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await refreshUser();
        router.push(redirect);
        router.refresh();
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("A network error occurred");
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
              Log in
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Sign in with your NUSNET ID and password
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
                  required
                />
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
                {loading ? "Signing in..." : "Log in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
              Don&apos;t have an account?{" "}
              <Link
                href={`/signup${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
                className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
          </div>
        </PageContainer>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
