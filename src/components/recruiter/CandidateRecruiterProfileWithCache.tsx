"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import {
  RecruiterProfileView,
  type RecruiterProfileTab,
} from "@/components/recruiter/RecruiterProfileView";
import {
  formatRecruiterAvgTimeToHire,
  formatRecruiterStatCount,
} from "@/lib/jobs/format-recruiter-job-stats";
import type { CandidateRecruiterProfileData } from "@/lib/recruiter/candidate-recruiter-profile.types";
import {
  resolveRecruiterProfileVisibility,
} from "@/lib/recruiter/recruiter-profile-visibility";
import { fetchCandidateRecruiterProfile } from "@/lib/query/candidate-recruiter-fetchers";
import { candidateRecruiterKeys } from "@/lib/query/candidate-recruiter-keys";
import { connectionKeys } from "@/lib/query/connection-keys";
import { useCandidateRecruiterConnectionStatusQuery } from "@/lib/query/use-connection-queries";

const CANDIDATE_VIEW_TABS: RecruiterProfileTab[] = ["overview", "roles"];

type CandidateRecruiterProfileWithCacheProps = {
  recruiterId: string;
  initialProfile: CandidateRecruiterProfileData;
};

export function CandidateRecruiterProfileWithCache({
  recruiterId,
  initialProfile,
}: CandidateRecruiterProfileWithCacheProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<RecruiterProfileTab>("overview");

  const { data: profile } = useQuery({
    queryKey: candidateRecruiterKeys.profile(recruiterId),
    queryFn: () => fetchCandidateRecruiterProfile(recruiterId),
    initialData: initialProfile,
  });

  const { data: connection } = useCandidateRecruiterConnectionStatusQuery(
    recruiterId,
  );

  useEffect(() => {
    if (connection?.status === "connected") {
      void queryClient.invalidateQueries({
        queryKey: candidateRecruiterKeys.profile(recruiterId),
      });
    }
  }, [connection?.status, queryClient, recruiterId]);

  const visibility = useMemo(
    () =>
      resolveRecruiterProfileVisibility({
        candidateView: true,
        connection: connection ?? null,
      }),
    [connection],
  );

  const jobStats = useMemo(() => {
    if (!profile) {
      return {
        totalPlacements: "0",
        activeRoles: "0",
        candidatesWorkedWith: "0",
        avgTimeToHire: "—",
      };
    }

    return {
      totalPlacements: formatRecruiterStatCount(profile.stats.totalPlacements),
      activeRoles: formatRecruiterStatCount(profile.stats.activeRoles),
      candidatesWorkedWith: formatRecruiterStatCount(
        profile.stats.candidatesWorkedWith,
      ),
      avgTimeToHire: formatRecruiterAvgTimeToHire(
        profile.stats.avgTimeToHireDays,
      ),
    };
  }, [profile]);

  if (!profile) {
    return null;
  }

  function handleConnectionChange() {
    void queryClient.invalidateQueries({
      queryKey: connectionKeys.recruiterProfileStatus(recruiterId),
    });
    void queryClient.invalidateQueries({
      queryKey: candidateRecruiterKeys.profile(recruiterId),
    });
    void queryClient.invalidateQueries({
      queryKey: candidateRecruiterKeys.all,
    });
  }

  return (
    <RecruiterProfileView
      profile={profile}
      visibility={visibility}
      jobStats={jobStats}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      availableTabs={CANDIDATE_VIEW_TABS}
      connection={connection ?? null}
      onConnectionChange={handleConnectionChange}
      recruiterId={recruiterId}
      publishedRoles={profile.activeRoles}
      hiringPreferences={profile.hiringPreferences}
    />
  );
}
