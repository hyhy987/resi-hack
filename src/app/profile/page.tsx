"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default function ProfilePage() {
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ProfileForm />
      </div>
    </PageContainer>
  );
}
