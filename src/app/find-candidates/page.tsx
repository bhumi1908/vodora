import { redirect } from "next/navigation";

import { CandidatePeerDirectory } from "@/components/candidate-directory/CandidatePeerDirectory";
import { getRecruiterDashboardAccessDeniedRedirect } from "@/lib/auth/access-denied";
import { getAccountType } from "@/lib/auth/account-type";
import {
  getLoginRedirect,
  getRouteProtectionRedirect,
} from "@/lib/auth/route-protection";
import { CANDIDATE_FIND_CANDIDATES_PATH } from "@/lib/auth/routes";
import { getCachedCandidateSearchFilters } from "@/lib/candidate/fetch-candidate-search-filters";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Find Candidates — Vodora",
  description:
    "Browse verified professionals in the Vodora directory and connect with peers.",
};

export default async function FindCandidatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    CANDIDATE_FIND_CANDIDATES_PATH,
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  const accountType = user ? await getAccountType(supabase, user) : null;

  if (accountType !== "candidate") {
    redirect(getRecruiterDashboardAccessDeniedRedirect());
  }

  const filters = await getCachedCandidateSearchFilters(supabase);

  if (!user) {
    redirect(getLoginRedirect(CANDIDATE_FIND_CANDIDATES_PATH));
  }

  return <CandidatePeerDirectory filters={filters} />;
}
