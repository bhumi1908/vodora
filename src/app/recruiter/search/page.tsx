import { redirect } from "next/navigation";

import { RecruiterCandidateSearch } from "@/components/recruiter/RecruiterCandidateSearch";
import { getCandidateDashboardAccessDeniedRedirect } from "@/lib/auth/access-denied";
import { getAccountType } from "@/lib/auth/account-type";
import {
  getLoginRedirect,
  getRouteProtectionRedirect,
} from "@/lib/auth/route-protection";
import { RECRUITER_SEARCH_PATH } from "@/lib/auth/routes";
import { getCachedRecruiterSearchFilters } from "@/lib/recruiter/fetch-recruiter-search-filters";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Find Candidates — Vodora",
  description: "Search verified candidates in the Vodora directory.",
};

export default async function RecruiterSearchPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    RECRUITER_SEARCH_PATH,
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  const accountType = user ? await getAccountType(supabase, user) : null;

  if (accountType !== "recruiter") {
    redirect(getCandidateDashboardAccessDeniedRedirect());
  }

  const filters = await getCachedRecruiterSearchFilters(supabase);

  if (!user) {
    redirect(getLoginRedirect(RECRUITER_SEARCH_PATH));
  }

  return <RecruiterCandidateSearch filters={filters} />;
}
