import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export type OwnCandidateContext = {
  userId: string;
  candidateId: string;
};

export async function requireOwnCandidate(
  supabase: Supabase,
): Promise<OwnCandidateContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: candidate } = await supabase
    .from("candidates")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!candidate) {
    return null;
  }

  return {
    userId: user.id,
    candidateId: candidate.id,
  };
}
