import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import type { CandidateDashboardData } from "@/lib/candidate/dashboard.types";
import { fetchCandidateDashboardCounts } from "@/lib/candidate/candidate-dashboard-counts";
import { fetchCandidateConnectionCounts } from "@/lib/connections/fetch-connection-counts";
import { fetchAppliedJobs } from "@/lib/jobs/fetch-applied-jobs";
import { getCachedOwnCandidateProfileRaw } from "@/lib/profile/fetch-own-candidate-profile";
import { computeProfileCompletion } from "@/lib/profile/profile-completion";
import { transformOwnCandidateProfileToView } from "@/lib/profile/transform-own-candidate-profile";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

const RECENT_APPLICATIONS_LIMIT = 5;

async function fetchCandidateDashboardContext(
  supabase: Supabase,
  userId: string,
): Promise<CandidateDashboardData["context"] | null> {
  const [{ data: userRow, error: userError }, { data: candidate }] =
    await Promise.all([
      supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("candidates")
        .select("current_position, profile_picture_url")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

  if (userError || !userRow) {
    return null;
  }

  return {
    firstName: userRow.first_name,
    lastName: userRow.last_name,
    title: candidate?.current_position ?? null,
    profilePictureUrl: candidate?.profile_picture_url ?? null,
  };
}

async function fetchVerifiedReferenceCount(
  supabase: Supabase,
  candidateId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc("count_verified_references", {
    p_candidate_id: candidateId,
  });

  if (error || typeof data !== "number") {
    return 0;
  }

  return data;
}

async function fetchCandidateDashboardData(
  supabase: Supabase,
  userId?: string,
): Promise<CandidateDashboardData | null> {
  let resolvedUserId = userId;

  if (!resolvedUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    resolvedUserId = user?.id;
  }

  if (!resolvedUserId) {
    return null;
  }

  const [
    context,
    profileRaw,
    connectionCounts,
    dashboardCounts,
    applicationsResult,
  ] = await Promise.all([
    fetchCandidateDashboardContext(supabase, resolvedUserId),
    getCachedOwnCandidateProfileRaw(supabase),
    fetchCandidateConnectionCounts(supabase),
    fetchCandidateDashboardCounts(supabase),
    fetchAppliedJobs(supabase),
  ]);

  if (!context) {
    return null;
  }

  const profile = profileRaw
    ? transformOwnCandidateProfileToView(profileRaw)
    : null;
  const candidateId = profileRaw?.candidate?.id ?? null;
  const verifiedReferenceCount = candidateId
    ? await fetchVerifiedReferenceCount(supabase, candidateId)
    : 0;

  const completion = profile
    ? computeProfileCompletion(profile, { verifiedReferenceCount })
    : { items: [], percent: 0 };

  return {
    context,
    profileCompletionPercent: completion.percent,
    profileCompletionItems: completion.items,
    connectionCounts,
    applicationsCount: dashboardCounts.applicationsCount,
    profileViewsCount: dashboardCounts.profileViewsCount,
    recentApplications: applicationsResult.applications.slice(
      0,
      RECENT_APPLICATIONS_LIMIT,
    ),
    applicationsError: applicationsResult.error,
  };
}

export const getCachedCandidateDashboardData = cache(fetchCandidateDashboardData);
