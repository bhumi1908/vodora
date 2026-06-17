import { redirect } from "next/navigation";

import { getAccountType } from "@/lib/auth/account-type";
import { getRouteProtectionRedirect } from "@/lib/auth/route-protection";
import { RECRUITER_DASHBOARD_PATH } from "@/lib/auth/routes";
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
    "/dashboard",
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  const accountType = user ? await getAccountType(supabase, user) : null;

  if (accountType !== "candidate") {
    redirect(RECRUITER_DASHBOARD_PATH);
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-gray-900">
        Candidate Dashboard — In Progress
      </h1>
    </div>
  );
}
