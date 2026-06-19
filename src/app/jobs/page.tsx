import { redirect } from "next/navigation";

import { CandidateJobBoard } from "@/components/jobs/CandidateJobBoard";
import { getRecruiterDashboardAccessDeniedRedirect } from "@/lib/auth/access-denied";
import { getAccountType } from "@/lib/auth/account-type";
import {
  getLoginRedirect,
  getRouteProtectionRedirect,
} from "@/lib/auth/route-protection";
import { CANDIDATE_JOBS_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Search for Jobs — Vodora",
  description: "Browse verified job opportunities posted by trusted recruiters.",
};

export default async function CandidateJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    CANDIDATE_JOBS_PATH,
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  const accountType = user ? await getAccountType(supabase, user) : null;

  if (accountType !== "candidate") {
    redirect(getRecruiterDashboardAccessDeniedRedirect());
  }

  if (!user) {
    redirect(getLoginRedirect(CANDIDATE_JOBS_PATH));
  }

  return <CandidateJobBoard />;
}
