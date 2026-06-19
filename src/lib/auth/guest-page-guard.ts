import { redirect } from "next/navigation";

import { getAccountType } from "@/lib/auth/account-type";
import { getUnverifiedSessionRedirect } from "@/lib/auth/email-verification-status";
import { getDashboardPath } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export async function redirectIfAuthenticated(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const unverifiedRedirect = await getUnverifiedSessionRedirect(supabase, user);

  if (unverifiedRedirect) {
    redirect(unverifiedRedirect);
  }

  const accountType = await getAccountType(supabase, user);
  redirect(getDashboardPath(accountType));
}
