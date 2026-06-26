"use client";

import { useQuery } from "@tanstack/react-query";

import { CandidateDashboard } from "@/components/candidate/CandidateDashboard";
import type { CandidateDashboardData } from "@/lib/candidate/dashboard.types";
import { fetchCandidateDashboardData } from "@/lib/query/candidate-fetchers";
import { candidateKeys } from "@/lib/query/keys";

const DASHBOARD_STALE_TIME = 60_000;

type CandidateDashboardWithCacheProps = {
  initialData: CandidateDashboardData;
  initialDataUpdatedAt?: number;
};

export function CandidateDashboardWithCache({
  initialData,
  initialDataUpdatedAt,
}: CandidateDashboardWithCacheProps) {
  const { data } = useQuery({
    queryKey: candidateKeys.dashboard(),
    queryFn: fetchCandidateDashboardData,
    initialData,
    initialDataUpdatedAt: initialDataUpdatedAt ?? Date.now(),
    staleTime: DASHBOARD_STALE_TIME,
  });

  if (!data) {
    return null;
  }

  return <CandidateDashboard data={data} />;
}
