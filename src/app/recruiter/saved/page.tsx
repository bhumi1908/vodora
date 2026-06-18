import { redirect } from "next/navigation";

import { RecruiterSavedCandidates } from "@/components/recruiter/RecruiterSavedCandidates";
import { getCandidateDashboardAccessDeniedRedirect } from "@/lib/auth/access-denied";
import { getAccountType } from "@/lib/auth/account-type";
import {
  getLoginRedirect,
  getRouteProtectionRedirect,
} from "@/lib/auth/route-protection";
import { RECRUITER_SAVED_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Saved Candidates — Vodora",
  description: "View candidates you have saved in Vodora.",
};

export default async function RecruiterSavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    RECRUITER_SAVED_PATH,
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  const accountType = user ? await getAccountType(supabase, user) : null;

  if (accountType !== "recruiter") {
    redirect(getCandidateDashboardAccessDeniedRedirect());
  }

  if (!user) {
    redirect(getLoginRedirect(RECRUITER_SAVED_PATH));
  }

  return <RecruiterSavedCandidates />;
}
