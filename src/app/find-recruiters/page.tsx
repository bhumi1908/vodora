import { redirect } from "next/navigation";

import { RecruiterDirectory } from "@/components/recruiter-directory/RecruiterDirectory";
import { getRecruiterDashboardAccessDeniedRedirect } from "@/lib/auth/access-denied";
import { getAccountType } from "@/lib/auth/account-type";
import {
  getLoginRedirect,
  getRouteProtectionRedirect,
} from "@/lib/auth/route-protection";
import { CANDIDATE_FIND_RECRUITERS_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Find a Recruiter — Vodora",
  description:
    "Browse verified recruiters, see what roles they're hiring for, and connect directly.",
};

export default async function FindRecruitersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    CANDIDATE_FIND_RECRUITERS_PATH,
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  const accountType = user ? await getAccountType(supabase, user) : null;

  if (accountType !== "candidate") {
    redirect(getRecruiterDashboardAccessDeniedRedirect());
  }

  if (!user) {
    redirect(getLoginRedirect(CANDIDATE_FIND_RECRUITERS_PATH));
  }

  return <RecruiterDirectory />;
}
