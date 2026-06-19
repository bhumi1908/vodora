import { redirect } from "next/navigation";

import { RecruiterProfileEditPage } from "@/components/recruiter/RecruiterProfileEditPage";
import { getCandidateDashboardAccessDeniedRedirect } from "@/lib/auth/access-denied";
import { getAccountType } from "@/lib/auth/account-type";
import {
  getLoginRedirect,
  getRouteProtectionRedirect,
} from "@/lib/auth/route-protection";
import { RECRUITER_PROFILE_EDIT_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Edit Profile — Vodora",
  description: "Update your recruiter profile and company details.",
};

export default async function RecruiterProfileEditRoutePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    RECRUITER_PROFILE_EDIT_PATH,
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  const accountType = user ? await getAccountType(supabase, user) : null;

  if (accountType !== "recruiter") {
    redirect(getCandidateDashboardAccessDeniedRedirect());
  }

  if (!user) {
    redirect(getLoginRedirect(RECRUITER_PROFILE_EDIT_PATH));
  }

  return <RecruiterProfileEditPage />;
}
