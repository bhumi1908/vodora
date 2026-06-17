import { redirect } from "next/navigation";

import { RecruiterDashboard } from "@/components/recruiter/RecruiterDashboard";
import { getAccountType } from "@/lib/auth/account-type";
import {
  getLoginRedirect,
  getRouteProtectionRedirect,
} from "@/lib/auth/route-protection";
import { RECRUITER_DASHBOARD_PATH } from "@/lib/auth/routes";
import { getCachedRecruiterDashboardData } from "@/lib/recruiter/fetch-recruiter-dashboard";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Recruiter Dashboard — Vodora",
  description: "Recruiter dashboard and verified candidate search.",
};

export default async function RecruiterDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    RECRUITER_DASHBOARD_PATH,
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  const accountType = user ? await getAccountType(supabase, user) : null;

  if (accountType !== "recruiter") {
    redirect("/dashboard");
  }

  const data = await getCachedRecruiterDashboardData(supabase);

  if (!data) {
    redirect(getLoginRedirect(RECRUITER_DASHBOARD_PATH));
  }

  return <RecruiterDashboard data={data} />;
}
