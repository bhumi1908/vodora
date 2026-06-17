import type { SupabaseClient, User } from "@supabase/supabase-js";

import { getAccountType } from "@/lib/auth/account-type";
import { getDashboardPath, getWelcomePath } from "@/lib/auth/routes";

export async function getPostLoginRedirect(
  supabase: SupabaseClient,
  user: User,
): Promise<string> {
  const accountType = await getAccountType(supabase, user);

  const { data: userRow } = await supabase
    .from("users")
    .select("login_count")
    .eq("id", user.id)
    .single();

  const loginCount = userRow?.login_count ?? 0;

  if (loginCount === 0) {
    return getWelcomePath(accountType);
  }

  return getDashboardPath(accountType);
}
