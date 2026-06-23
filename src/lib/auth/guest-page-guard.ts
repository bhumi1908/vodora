import { redirect } from "next/navigation";

import { getAccountType } from "@/lib/auth/account-type";
import { getUnverifiedSessionRedirect } from "@/lib/auth/email-verification-status";
import { getDashboardPath } from "@/lib/auth/routes";
import { resolvePostLoginRedirect } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/server";

export async function redirectIfAuthenticated(
  requestedRedirect?: string | null,
): Promise<void> {
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

  if (requestedRedirect) {
    const safeRedirect = await resolvePostLoginRedirect(
      supabase,
      user,
      requestedRedirect,
    );
    redirect(safeRedirect);
  }

  const accountType = await getAccountType(supabase, user);
  redirect(getDashboardPath(accountType));
}
