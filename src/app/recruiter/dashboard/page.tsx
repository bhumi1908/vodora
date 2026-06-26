import { redirect } from "next/navigation";

import { RecruiterDashboardWithCache } from "@/components/recruiter/RecruiterDashboardWithCache";
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

  const data = await getCachedRecruiterDashboardData(supabase, user!.id);

  if (!data) {
    redirect(getLoginRedirect(RECRUITER_DASHBOARD_PATH));
  }

  return (
    <RecruiterDashboardWithCache
      initialData={data}
      initialDataUpdatedAt={Date.now()}
      recruiterUserId={user!.id}
    />
  );
}
