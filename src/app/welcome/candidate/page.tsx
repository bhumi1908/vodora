import { redirect } from "next/navigation";

import { CandidateWelcome } from "@/components/welcome/CandidateWelcome";
import { getCachedAuthUser } from "@/lib/auth/cached-auth";
import {
  getWelcomeLoginRedirect,
  getWelcomePageRedirect,
} from "@/lib/auth/welcome-guard";
import { getOwnCandidateProfileForEdit } from "@/lib/profile/get-candidate-profile-for-edit";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Welcome — Vodora",
  description: "Complete your professional profile on Vodora.",
};

export default async function CandidateWelcomePage() {
  const supabase = await createClient();
  const user = await getCachedAuthUser(supabase);

  if (!user) {
    redirect(getWelcomeLoginRedirect("candidate"));
  }

  const redirectTo = await getWelcomePageRedirect(supabase, user, "candidate");

  if (redirectTo) {
    redirect(redirectTo);
  }

  const profile = await getOwnCandidateProfileForEdit(supabase);

  if (!profile) {
    redirect(getWelcomeLoginRedirect("candidate"));
  }

  return <CandidateWelcome profile={profile} />;
}
