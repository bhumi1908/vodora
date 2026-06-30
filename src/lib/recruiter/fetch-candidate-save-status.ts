import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function fetchRecruiterCandidateSavedStatus(
  supabase: Supabase,
  candidateId: string,
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: recruiter, error: recruiterError } = await supabase
    .from("recruiters")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (recruiterError || !recruiter) {
    return false;
  }

  const { data: existing, error: lookupError } = await supabase
    .from("recruiter_saved_candidates")
    .select("id")
    .eq("recruiter_id", recruiter.id)
    .eq("candidate_id", candidateId)
    .maybeSingle();

  if (lookupError) {
    return false;
  }

  return Boolean(existing);
}
