import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import {
  normalizeRpcResult,
  transformOwnCandidateProfileToView,
} from "@/lib/profile/transform-own-candidate-profile";
import type { CandidateProfileData } from "@/lib/profile/types";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function fetchRecruiterCandidateProfile(
  supabase: Supabase,
  vodoraId: string,
): Promise<CandidateProfileData | null> {
  const { data, error } = await supabase.rpc("get_recruiter_candidate_profile", {
    p_vodora_id: vodoraId,
  });

  if (error || !data) {
    return null;
  }

  const raw = normalizeRpcResult(data);

  if (!raw) {
    return null;
  }

  return transformOwnCandidateProfileToView(raw);
}

export const getCachedRecruiterCandidateProfile = cache(
  fetchRecruiterCandidateProfile,
);

export async function fetchRecruiterCandidateProfilesBatch(
  supabase: Supabase,
  vodoraIds: string[],
): Promise<Map<string, CandidateProfileData>> {
  const uniqueIds = [
    ...new Set(vodoraIds.map((id) => id.trim()).filter((id) => id.length > 0)),
  ];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase.rpc(
    "get_recruiter_candidate_profiles_batch",
    {
      p_vodora_ids: uniqueIds,
    },
  );

  if (error || !Array.isArray(data)) {
    return new Map();
  }

  const profiles = new Map<string, CandidateProfileData>();

  for (const item of data) {
    const raw = normalizeRpcResult(item);
    const profile = raw ? transformOwnCandidateProfileToView(raw) : null;
    const vodoraId = raw?.candidate?.vodora_id;

    if (profile && vodoraId) {
      profiles.set(vodoraId, profile);
    }
  }

  return profiles;
}
