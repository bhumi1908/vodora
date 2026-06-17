"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import {
  ALL_PROFILE_SECTIONS,
  CandidateProfileEditor,
} from "@/components/profile/edit/CandidateProfileEditor";
import { useRequiredMyProfileData } from "@/components/profile/MyProfileDataProvider";
import { transformOwnCandidateProfileToEdit } from "@/lib/profile/transform-own-candidate-profile";

export function EditMyProfilePageClient() {
  const router = useRouter();
  const rawProfile = useRequiredMyProfileData();
  const profile = useMemo(
    () => transformOwnCandidateProfileToEdit(rawProfile),
    [rawProfile],
  );

  useEffect(() => {
    if (!rawProfile.candidate) {
      router.replace("/my-profile");
    }
  }, [rawProfile.candidate, router]);

  if (!profile) {
    return null;
  }

  return (
    <CandidateProfileEditor
      initialProfile={profile}
      sections={ALL_PROFILE_SECTIONS}
      backHref="/my-profile"
    />
  );
}
