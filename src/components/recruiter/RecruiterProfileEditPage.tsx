"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { RecruiterProfileEditor } from "@/components/recruiter/edit/RecruiterProfileEditor";
import {
  useMyRecruiterProfileLoading,
  useRequiredMyRecruiterProfileData,
} from "@/components/recruiter/MyRecruiterProfileDataProvider";
import { RecruiterProfileEditSkeleton } from "@/components/recruiter/RecruiterProfileEditSkeleton";
import { RECRUITER_PROFILE_PATH } from "@/lib/auth/routes";
import { transformOwnRecruiterProfileToEdit } from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";

export function RecruiterProfileEditPage() {
  const router = useRouter();
  const rawProfile = useRequiredMyRecruiterProfileData();
  const isLoading = useMyRecruiterProfileLoading();
  const profile = useMemo(
    () => transformOwnRecruiterProfileToEdit(rawProfile),
    [rawProfile],
  );

  useEffect(() => {
    if (!isLoading && !rawProfile.recruiter) {
      router.replace(RECRUITER_PROFILE_PATH);
    }
  }, [isLoading, rawProfile.recruiter, router]);

  if (isLoading || !profile) {
    return <RecruiterProfileEditSkeleton />;
  }

  return (
    <RecruiterProfileEditor
      initialProfile={profile}
      backHref={RECRUITER_PROFILE_PATH}
    />
  );
}
