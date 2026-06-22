import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function fetchRecruiterApplicationTotal(
  supabase: Supabase,
  recruiterId: string,
): Promise<{ total: number; error: string | null }> {
  const { data: postings, error: postingsError } = await supabase
    .from("job_postings")
    .select("id")
    .eq("recruiter_id", recruiterId);

  if (postingsError) {
    return { total: 0, error: postingsError.message };
  }

  const jobIds = (postings ?? []).map((posting) => posting.id);

  if (jobIds.length === 0) {
    return { total: 0, error: null };
  }

  const { count, error } = await supabase
    .from("job_applications")
    .select("id", { count: "exact", head: true })
    .in("job_posting_id", jobIds);

  if (error) {
    return { total: 0, error: error.message };
  }

  return { total: count ?? 0, error: null };
}

export async function requireRecruiterId(
  supabase: Supabase,
  userId: string,
): Promise<string | null> {
  const { data: recruiter } = await supabase
    .from("recruiters")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  return recruiter?.id ?? null;
}
