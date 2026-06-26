import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export type CandidateDashboardCounts = {
  profileViewsCount: number;
  applicationsCount: number;
};

const EMPTY_DASHBOARD_COUNTS: CandidateDashboardCounts = {
  profileViewsCount: 0,
  applicationsCount: 0,
};

type RpcDashboardCounts = {
  profile_views_count?: number;
  applications_count?: number;
};

function normalizeDashboardCounts(data: unknown): CandidateDashboardCounts {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return EMPTY_DASHBOARD_COUNTS;
  }

  const payload = data as RpcDashboardCounts;

  return {
    profileViewsCount: payload.profile_views_count ?? 0,
    applicationsCount: payload.applications_count ?? 0,
  };
}

export async function fetchCandidateDashboardCounts(
  supabase: Supabase,
): Promise<CandidateDashboardCounts> {
  const { data, error } = await supabase.rpc("get_candidate_dashboard_counts");

  if (error) {
    return EMPTY_DASHBOARD_COUNTS;
  }

  return normalizeDashboardCounts(data);
}
