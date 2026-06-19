import type { SupabaseClient, User } from "@supabase/supabase-js";

import { EMAIL_FEATURES_ENABLED } from "@/lib/auth/email-features";

export function getVerifyEmailPath(email: string): string {
  const params = new URLSearchParams();

  if (email.trim()) {
    params.set("email", email.trim());
  }

  const query = params.toString();
  return query ? `/verify-email?${query}` : "/verify-email";
}

export async function isSessionEmailVerified(
  supabase: SupabaseClient,
  user: User,
): Promise<boolean> {
  if (!EMAIL_FEATURES_ENABLED) {
    return true;
  }

  const { data, error } = await supabase
    .from("users")
    .select("email_verified_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data?.email_verified_at);
}

export async function getUnverifiedSessionRedirect(
  supabase: SupabaseClient,
  user: User,
): Promise<string | null> {
  const verified = await isSessionEmailVerified(supabase, user);

  if (verified) {
    return null;
  }

  return getVerifyEmailPath(user.email ?? "");
}
