import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import {
  normalizeRpcResult,
  transformOwnCandidateProfileToView,
} from "@/lib/profile/transform-own-candidate-profile";
import type { CandidateProfileData } from "@/lib/profile/types";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function fetchCandidatePeerProfile(
  supabase: Supabase,
  vodoraId: string,
): Promise<CandidateProfileData | null> {
  const { data, error } = await supabase.rpc("get_candidate_peer_profile", {
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

export const getCachedCandidatePeerProfile = cache(fetchCandidatePeerProfile);
