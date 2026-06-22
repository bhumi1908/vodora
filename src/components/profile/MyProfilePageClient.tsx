"use client";

import { useMemo } from "react";

import { ProfileViewSkeleton } from "@/components/profile/ProfileViewSkeleton";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { useRequiredMyProfileData } from "@/components/profile/MyProfileDataProvider";
import {
  transformOwnCandidateProfileToEdit,
  transformOwnCandidateProfileToView,
} from "@/lib/profile/transform-own-candidate-profile";

export function MyProfilePageClient() {
  const rawProfile = useRequiredMyProfileData();
  const profile = useMemo(
    () => transformOwnCandidateProfileToView(rawProfile),
    [rawProfile],
  );
  const editProfile = useMemo(
    () => transformOwnCandidateProfileToEdit(rawProfile),
    [rawProfile],
  );

  if (!profile || !editProfile) {
    return <ProfileViewSkeleton />;
  }

  return (
    <ProfilePage profile={profile} isOwnProfile editProfile={editProfile} />
  );
}