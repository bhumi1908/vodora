import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import type { CandidateRecruiterProfileData } from "@/lib/recruiter/candidate-recruiter-profile.types";
import {
  normalizeCandidateRecruiterProfileRpcResult,
  transformCandidateRecruiterProfileToView,
} from "@/lib/recruiter/transform-candidate-recruiter-profile";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function fetchCandidateRecruiterProfile(
  supabase: Supabase,
  recruiterId: string,
): Promise<CandidateRecruiterProfileData | null> {
  const { data, error } = await supabase.rpc("get_recruiter_profile_for_candidate", {
    p_recruiter_id: recruiterId,
  });

  if (error || !data) {
    return null;
  }

  const raw = normalizeCandidateRecruiterProfileRpcResult(data);

  if (!raw) {
    return null;
  }

  return transformCandidateRecruiterProfileToView(raw);
}

export const getCachedCandidateRecruiterProfile = cache(fetchCandidateRecruiterProfile);
