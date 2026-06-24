import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function checkRecruiterReferenceGrant(
  supabase: Supabase,
  candidateId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("recruiter_has_reference_grant", {
    p_candidate_id: candidateId,
  });

  if (error) {
    console.error("checkRecruiterReferenceGrant failed:", error);
    return false;
  }

  return Boolean(data);
}
