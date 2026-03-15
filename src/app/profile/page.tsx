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
      <div className="glass-card-static p-8 animate-fade-in-up stagger-2">
        {currentUser && (
          <>
            {!isEditing ? (
              <>
                <div className="space-y-8 mb-8">
                  <div>
                    <h3 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-widest mb-4">Personal info</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)]">
                        <dt className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-1">Name</dt>
                        <dd className="font-medium text-[var(--text-primary)]">{currentUser.name}</dd>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)]">
                        <dt className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-1">NUSNET ID</dt>
                        <dd className="font-mono text-[var(--text-primary)]">{currentUser.nusId}</dd>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)]">
                        <dt className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-1">Dining Hall</dt>
                        <dd className="text-[var(--text-primary)]">{currentUser.diningHall}</dd>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)]">
                        <dt className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-1">Telegram</dt>
                        <dd className="text-[var(--text-primary)]">{currentUser.contactHandle || "—"}</dd>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-widest mb-4">Credit balance</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)]">
                        <dt className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-1">Breakfast</dt>
                        <dd className="font-medium text-[var(--text-primary)]">{currentUser.breakfastCredits ?? 0}</dd>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)]">
                        <dt className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-1">Dinner</dt>
                        <dd className="font-medium text-[var(--text-primary)]">{currentUser.dinnerCredits ?? 0}</dd>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setIsEditing(true)} className="py-3 min-w-[120px]">
                    Edit
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
