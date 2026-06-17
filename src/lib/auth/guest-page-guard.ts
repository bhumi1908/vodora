import { redirect } from "next/navigation";

import { getAccountType } from "@/lib/auth/account-type";
import { getDashboardPath } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export async function redirectIfAuthenticated(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const accountType = await getAccountType(supabase, user);
    redirect(getDashboardPath(accountType));
  }
}
