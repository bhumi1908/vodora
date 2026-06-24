"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { ProfilePage } from "@/components/profile/ProfilePage";
import type { CandidateProfileData } from "@/lib/profile/types";
import { fetchCandidatePeerProfile } from "@/lib/query/candidate-peer-fetchers";
import { candidatePeerKeys } from "@/lib/query/candidate-peer-keys";
import { connectionKeys } from "@/lib/query/connection-keys";
import { useCandidatePeerConnectionStatusQuery } from "@/lib/query/use-connection-queries";

type CandidatePeerProfileWithCacheProps = {
  vodoraId: string;
  initialProfile: CandidateProfileData;
};

export function CandidatePeerProfileWithCache({
  vodoraId,
  initialProfile,
}: CandidatePeerProfileWithCacheProps) {
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: candidatePeerKeys.candidateProfile(vodoraId),
    queryFn: () => fetchCandidatePeerProfile(vodoraId),
    initialData: initialProfile,
  });

  const { data: connection } = useCandidatePeerConnectionStatusQuery(
    profile?.candidateId ?? null,
  );

  useEffect(() => {
    if (connection?.status === "connected") {
      void queryClient.invalidateQueries({
        queryKey: candidatePeerKeys.candidateProfile(vodoraId),
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
      queryKey: connectionKeys.peerProfileStatus(profile.candidateId),
    });
    void queryClient.invalidateQueries({
      queryKey: candidatePeerKeys.candidateProfile(vodoraId),
    });
  }

  return (
    <ProfilePage
      profile={profile}
      peerView
      connection={connection ?? null}
      onConnectionChange={handleConnectionChange}
    />
  );
}
