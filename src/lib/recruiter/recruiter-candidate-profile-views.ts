import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export type RecruiterDashboardCounts = {
  savedCount: number;
  candidatesViewedCount: number;
};

const EMPTY_DASHBOARD_COUNTS: RecruiterDashboardCounts = {
  savedCount: 0,
  candidatesViewedCount: 0,
};

type RpcDashboardCounts = {
  saved_count?: number;
  candidates_viewed_count?: number;
};

function normalizeDashboardCounts(data: unknown): RecruiterDashboardCounts {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return EMPTY_DASHBOARD_COUNTS;
  }

  const payload = data as RpcDashboardCounts;

  return {
    savedCount: payload.saved_count ?? 0,
    candidatesViewedCount: payload.candidates_viewed_count ?? 0,
  };
}

export async function fetchRecruiterDashboardCounts(
  supabase: Supabase,
): Promise<RecruiterDashboardCounts> {
  const { data, error } = await supabase.rpc("get_recruiter_dashboard_counts");

  if (error) {
    return EMPTY_DASHBOARD_COUNTS;
  }

  return normalizeDashboardCounts(data);
}

export async function recordRecruiterCandidateProfileView(
  supabase: Supabase,
  candidateId: string,
): Promise<void> {
  if (!candidateId) {
    return;
  }

  const { error } = await supabase.rpc("record_recruiter_candidate_profile_view", {
    p_candidate_id: candidateId,
  });

  if (error) {
    throw error;
  }
}
