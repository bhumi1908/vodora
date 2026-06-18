"use client";

import { useQuery } from "@tanstack/react-query";

import { RecruiterDashboard } from "@/components/recruiter/RecruiterDashboard";
import type { RecruiterDashboardData } from "@/lib/recruiter/dashboard.types";
import { recruiterKeys } from "@/lib/query/keys";
import { fetchRecruiterDashboardData } from "@/lib/query/recruiter-fetchers";

const DASHBOARD_STALE_TIME = 60_000;

type RecruiterDashboardWithCacheProps = {
  initialData: RecruiterDashboardData;
  initialDataUpdatedAt?: number;
};

export function RecruiterDashboardWithCache({
  initialData,
  initialDataUpdatedAt,
}: RecruiterDashboardWithCacheProps) {
  const { data } = useQuery({
    queryKey: recruiterKeys.dashboard(),
    queryFn: fetchRecruiterDashboardData,
    initialData,
    initialDataUpdatedAt: initialDataUpdatedAt ?? Date.now(),
    staleTime: DASHBOARD_STALE_TIME,
  });

  if (!data) {
    return null;
  }

  return <RecruiterDashboard data={data} />;
}
