"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { ProfilePage } from "@/components/profile/ProfilePage";
import type { CandidateProfileData } from "@/lib/profile/types";
import { connectionKeys } from "@/lib/query/connection-keys";
import { recruiterKeys } from "@/lib/query/keys";
import { fetchRecruiterCandidateProfile } from "@/lib/query/recruiter-fetchers";
import { useRecruiterCandidateConnectionStatusQuery } from "@/lib/query/use-connection-queries";

type RecruiterCandidateProfileWithCacheProps = {
  vodoraId: string;
  initialProfile: CandidateProfileData;
  initialHasReferenceAccess?: boolean;
  initialIsSaved?: boolean;
};

export function RecruiterCandidateProfileWithCache({
  vodoraId,
  initialProfile,
  initialHasReferenceAccess = false,
  initialIsSaved = false,
}: RecruiterCandidateProfileWithCacheProps) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: recruiterKeys.candidateProfile(vodoraId),
    queryFn: () => fetchRecruiterCandidateProfile(vodoraId),
    initialData: {
      profile: initialProfile,
      hasReferenceAccess: initialHasReferenceAccess,
      isSaved: initialIsSaved,
    },
  });

  const profile = data?.profile ?? initialProfile;
  const hasReferenceAccess =
    data?.hasReferenceAccess ?? initialHasReferenceAccess;
  const isSaved = data?.isSaved ?? initialIsSaved;

  const { data: connection } = useRecruiterCandidateConnectionStatusQuery(
    profile?.candidateId ?? null,
  );

  useEffect(() => {
    if (connection?.status === "connected") {
      void queryClient.invalidateQueries({
        queryKey: recruiterKeys.candidateProfile(vodoraId),
      });
    }
  }, [connection?.status, queryClient, vodoraId]);

  if (!profile) {
    return null;
  }

  function handleConnectionChange() {
    if (!profile?.candidateId) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: connectionKeys.profileStatus(profile.candidateId),
    });
    void queryClient.invalidateQueries({
      queryKey: recruiterKeys.candidateProfile(vodoraId),
    });
  }

  return (
    <ProfilePage
      profile={profile}
      recruiterView
      connection={connection ?? null}
      hasReferenceAccess={hasReferenceAccess}
      isSaved={isSaved}
      onConnectionChange={handleConnectionChange}
    />
  );
}
