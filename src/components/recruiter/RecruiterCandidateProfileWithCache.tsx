"use client";

import { useQuery } from "@tanstack/react-query";

import { ProfilePage } from "@/components/profile/ProfilePage";
import type { CandidateProfileData } from "@/lib/profile/types";
import { recruiterKeys } from "@/lib/query/keys";
import { fetchRecruiterCandidateProfile } from "@/lib/query/recruiter-fetchers";

type RecruiterCandidateProfileWithCacheProps = {
  vodoraId: string;
  initialProfile: CandidateProfileData;
};

export function RecruiterCandidateProfileWithCache({
  vodoraId,
  initialProfile,
}: RecruiterCandidateProfileWithCacheProps) {
  const { data: profile } = useQuery({
    queryKey: recruiterKeys.candidateProfile(vodoraId),
    queryFn: () => fetchRecruiterCandidateProfile(vodoraId),
    initialData: initialProfile,
  });

  if (!profile) {
    return null;
  }

  return <ProfilePage profile={profile} recruiterView />;
}
