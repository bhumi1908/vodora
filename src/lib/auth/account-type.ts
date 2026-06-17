import type { SupabaseClient, User } from "@supabase/supabase-js";

import { isSignupProfile } from "@/lib/auth/registration";

export async function isRecruiterAccount(
  supabase: SupabaseClient,
  user: User,
): Promise<boolean> {
  const signupProfile = user.user_metadata?.signup_profile;

  if (isSignupProfile(signupProfile) && signupProfile.type === "recruiter") {
    return true;
  }

  const { data } = await supabase
    .from("recruiters")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return Boolean(data);
}

export async function getAccountType(
  supabase: SupabaseClient,
  user: User,
): Promise<"candidate" | "recruiter"> {
  return (await isRecruiterAccount(supabase, user)) ? "recruiter" : "candidate";
}
