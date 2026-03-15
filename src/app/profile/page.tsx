"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const { currentUser, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold font-[Outfit] text-[var(--text-primary)] tracking-tight mb-2">
          My Profile
        </h1>
        <p className="text-[var(--text-secondary)]">
          View and edit your details, contact info, and credit balance.
        </p>
      </div>

      {currentUser && !isEditing && (
        <div className="flex items-center gap-4 mb-6 animate-fade-in-up stagger-1">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[#c76a52] flex items-center justify-center text-2xl font-bold font-[Outfit] text-white shadow-lg shadow-[var(--accent-glow)]">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold font-[Outfit] text-[var(--text-primary)]">
              {currentUser.name}
            </h2>
            <p className="text-sm text-[var(--text-muted)] font-mono">{currentUser.nusId}</p>
          </div>
        </div>
      )}

      <div className="glass-card-static p-8 animate-fade-in-up stagger-2">
        {currentUser && (
          <>
            {!isEditing ? (
              <>
                <div className="space-y-8 mb-8">
                  <div>
                    <h3 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-widest mb-4">Personal info</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)] hover:border-[var(--border)] transition-colors">
                        <dt className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-1 flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          Name
                        </dt>
                        <dd className="font-medium text-[var(--text-primary)]">{currentUser.name}</dd>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)] hover:border-[var(--border)] transition-colors">
                        <dt className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-1 flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          NUSNET ID
                        </dt>
                        <dd className="font-mono text-[var(--text-primary)]">{currentUser.nusId}</dd>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)] hover:border-[var(--border)] transition-colors">
                        <dt className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-1 flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                          Dining Hall
                        </dt>
                        <dd className="text-[var(--text-primary)]">{currentUser.diningHall}</dd>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)] hover:border-[var(--border)] transition-colors">
                        <dt className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-1 flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m22 2-7 20-4-9-9-4Z" />
                            <path d="M22 2 11 13" />
                          </svg>
                          Telegram
                        </dt>
                        <dd className="text-[var(--text-primary)]">{currentUser.contactHandle || "—"}</dd>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-widest mb-4">Credit balance</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)] hover:border-[var(--border)] transition-colors">
                        <dt className="text-[10px] font-bold uppercase text-[var(--warning)] tracking-widest mb-1 flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v4" /><path d="m4.93 10.93 1.41 1.41" /><path d="M2 18h2" /><path d="M20 18h2" /><path d="m19.07 10.93-1.41 1.41" /><path d="M22 22H2" /><path d="M16 18a4 4 0 0 0-8 0" />
                          </svg>
                          Breakfast
                        </dt>
                        <dd className="text-2xl font-bold font-[Outfit] text-[var(--text-primary)]">{currentUser.breakfastCredits ?? 0}</dd>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)] hover:border-[var(--border)] transition-colors">
                        <dt className="text-[10px] font-bold uppercase text-[var(--request-blue)] tracking-widest mb-1 flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                          </svg>
                          Dinner
                        </dt>
                        <dd className="text-2xl font-bold font-[Outfit] text-[var(--text-primary)]">{currentUser.dinnerCredits ?? 0}</dd>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setIsEditing(true)} className="py-3 min-w-[120px]">
                    <span className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                      Edit
                    </span>
                  </Button>
                </div>
              </>
            ) : (
              <ProfileForm onSaved={() => setIsEditing(false)} />
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
