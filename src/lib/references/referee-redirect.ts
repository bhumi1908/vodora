import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function getOpenRefereeReferenceRespondPath(
  supabase: Supabase,
  email: string,
): Promise<string | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const { data, error } = await supabase
    .from("reference_requests")
    .select("invitation_token, invitation_expires_at")
    .eq("status", "pending")
    .ilike("referee_email", normalizedEmail)
    .gt("invitation_expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data?.invitation_token) {
    return null;
  }

  const params = new URLSearchParams({
    token: data.invitation_token,
  });

  return `/reference/respond?${params.toString()}`;
}
