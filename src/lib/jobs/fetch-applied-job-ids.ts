import type { SupabaseClient } from "@supabase/supabase-js";

import { requireOwnCandidate } from "@/lib/profile/require-own-candidate";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function fetchAppliedJobIds(
  supabase: Supabase,
): Promise<{ jobIds: string[]; error: string | null }> {
  const candidateContext = await requireOwnCandidate(supabase);

  if (!candidateContext) {
    return { jobIds: [], error: "Authentication required." };
  }

  const { data, error } = await supabase
    .from("job_applications")
    .select("job_posting_id")
    .eq("candidate_id", candidateContext.candidateId);

  if (error) {
    return { jobIds: [], error: error.message };
  }

  return {
    jobIds: (data ?? []).map((row) => row.job_posting_id),
    error: null,
  };
}
