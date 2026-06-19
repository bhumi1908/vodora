import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export type OwnRecruiterContext = {
  userId: string;
  recruiterId: string;
  companyId: string | null;
};

export async function requireOwnRecruiter(
  supabase: Supabase,
): Promise<OwnRecruiterContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: recruiter } = await supabase
    .from("recruiters")
    .select("id, company_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!recruiter) {
    return null;
  }

  return {
    userId: user.id,
    recruiterId: recruiter.id,
    companyId: recruiter.company_id,
  };
}
