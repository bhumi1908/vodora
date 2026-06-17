import type { SupabaseClient, User } from "@supabase/supabase-js";

import { getAccountType } from "@/lib/auth/account-type";
import {
  CANDIDATE_DASHBOARD_PATH,
  CANDIDATE_WELCOME_PATH,
  getDashboardPath,
  RECRUITER_DASHBOARD_PATH,
  RECRUITER_WELCOME_PATH,
} from "@/lib/auth/routes";

type WelcomeVariant = "candidate" | "recruiter";

export async function getWelcomePageRedirect(
  supabase: SupabaseClient,
  user: User,
  variant: WelcomeVariant,
): Promise<string | null> {
  const accountType = await getAccountType(supabase, user);

  if (accountType !== variant) {
    return accountType === "recruiter"
      ? RECRUITER_WELCOME_PATH
      : CANDIDATE_WELCOME_PATH;
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("login_count")
    .eq("id", user.id)
    .single();

  const loginCount = userRow?.login_count ?? 0;

  if (loginCount > 1) {
    return getDashboardPath(accountType);
  }

  return null;
}

export function getWelcomeLoginRedirect(variant: WelcomeVariant): string {
  const welcomePath =
    variant === "recruiter" ? RECRUITER_WELCOME_PATH : CANDIDATE_WELCOME_PATH;
  const params = new URLSearchParams({ redirect: welcomePath });
  if (variant === "recruiter") {
    params.set("type", "recruiter");
  }
  return `/login?${params.toString()}`;
}

export { CANDIDATE_DASHBOARD_PATH, RECRUITER_DASHBOARD_PATH };
