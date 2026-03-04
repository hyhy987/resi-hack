"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default function ProfilePage() {
  return (
    <PageContainer>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold font-[Outfit] text-[var(--text-primary)] tracking-tight mb-2">
          Profile
        </h1>
        <p className="text-[var(--text-secondary)]">
          Manage your name, contact details, and credit balance.
        </p>
      </div>
      <div className="glass-card-static p-8 max-w-lg animate-fade-in-up stagger-2">
        <ProfileForm />
      </div>
    </PageContainer>
  );
}
