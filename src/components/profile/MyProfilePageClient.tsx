"use client";

import { useMemo } from "react";

import { ProfileViewSkeleton } from "@/components/profile/ProfileViewSkeleton";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { useRequiredMyProfileData } from "@/components/profile/MyProfileDataProvider";
import { transformOwnCandidateProfileToView } from "@/lib/profile/transform-own-candidate-profile";

export function MyProfilePageClient() {
  const rawProfile = useRequiredMyProfileData();
  const profile = useMemo(
    () => transformOwnCandidateProfileToView(rawProfile),
    [rawProfile],
  );

  if (!profile) {
    return <ProfileViewSkeleton />;
  }

  return <ProfilePage profile={profile} isOwnProfile />;
}
 