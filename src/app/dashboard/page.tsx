import { redirect } from "next/navigation";

import { CandidateDashboardWithCache } from "@/components/candidate/CandidateDashboardWithCache";
import { getRecruiterDashboardAccessDeniedRedirect } from "@/lib/auth/access-denied";
import { getAccountType } from "@/lib/auth/account-type";
import {
  getLoginRedirect,
  getRouteProtectionRedirect,
} from "@/lib/auth/route-protection";
import { CANDIDATE_DASHBOARD_PATH } from "@/lib/auth/routes";
import { getCachedCandidateDashboardData } from "@/lib/candidate/fetch-candidate-dashboard";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard — Vodora",
  description: "Candidate dashboard.",
};

export default async function CandidateDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    CANDIDATE_DASHBOARD_PATH,
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  const accountType = user ? await getAccountType(supabase, user) : null;

  if (accountType !== "candidate") {
    redirect(getRecruiterDashboardAccessDeniedRedirect());
  }

  const data = await getCachedCandidateDashboardData(supabase, user!.id);

  if (!data) {
    redirect(getLoginRedirect(CANDIDATE_DASHBOARD_PATH));
  }

  return (
    <CandidateDashboardWithCache
      initialData={data}
      initialDataUpdatedAt={Date.now()}
    />
  );
}
