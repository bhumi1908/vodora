import type { SupabaseClient, User } from "@supabase/supabase-js";

import { getAccountType } from "@/lib/auth/account-type";
import { getDashboardPath, getWelcomePath } from "@/lib/auth/routes";
import { getOpenRefereeReferenceRespondPath } from "@/lib/references/referee-redirect";

export type PostLoginContext = {
  accountType: "candidate" | "recruiter";
  loginCount: number;
  email: string;
};

export async function getPostLoginRedirect(
  supabase: SupabaseClient,
  user: User,
  context?: Partial<PostLoginContext>,
): Promise<string> {
  const accountType =
    context?.accountType ?? (await getAccountType(supabase, user));

  let loginCount = context?.loginCount;
  let email = context?.email;

  if (loginCount === undefined || email === undefined) {
    const { data: userRow } = await supabase
      .from("users")
      .select("login_count, email")
      .eq("id", user.id)
      .single();

    loginCount = userRow?.login_count ?? 0;
    email = userRow?.email ?? user.email ?? "";
  }

  const resolvedLoginCount = loginCount ?? 0;
  const resolvedEmail = email ?? user.email ?? "";

  if (resolvedLoginCount === 0) {
    const refereeRespondPath = await getOpenRefereeReferenceRespondPath(
      supabase,
      resolvedEmail,
    );

    if (refereeRespondPath) {
      return refereeRespondPath;
    }

    return getWelcomePath(accountType);
  }

  return getDashboardPath(accountType);
}
