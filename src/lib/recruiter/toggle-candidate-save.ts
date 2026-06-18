import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export type ToggleCandidateSaveResult = {
  saved: boolean;
  error: string | null;
};

export async function toggleCandidateSave(
  supabase: Supabase,
  candidateId: string,
): Promise<ToggleCandidateSaveResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { saved: false, error: "Authentication required." };
  }

  const { data: recruiter, error: recruiterError } = await supabase
    .from("recruiters")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (recruiterError || !recruiter) {
    return { saved: false, error: "Recruiter profile not found." };
  }

  const { data: existing, error: lookupError } = await supabase
    .from("recruiter_saved_candidates")
    .select("id")
    .eq("recruiter_id", recruiter.id)
    .eq("candidate_id", candidateId)
    .maybeSingle();

  if (lookupError) {
    return { saved: false, error: lookupError.message };
  }

  if (existing) {
    const { error: deleteError } = await supabase
      .from("recruiter_saved_candidates")
      .delete()
      .eq("id", existing.id);

    if (deleteError) {
      return { saved: true, error: deleteError.message };
    }

    return { saved: false, error: null };
  }

  const { error: insertError } = await supabase
    .from("recruiter_saved_candidates")
    .insert({
      recruiter_id: recruiter.id,
      candidate_id: candidateId,
    });

  if (insertError) {
    return { saved: false, error: insertError.message };
  }

  return { saved: true, error: null };
}
