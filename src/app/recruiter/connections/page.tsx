import { redirect } from "next/navigation";

import { ConnectionsPage } from "@/components/connections/ConnectionsPage";
import { getCandidateDashboardAccessDeniedRedirect } from "@/lib/auth/access-denied";
import { getAccountType } from "@/lib/auth/account-type";
import {
  getLoginRedirect,
  getRouteProtectionRedirect,
} from "@/lib/auth/route-protection";
import { RECRUITER_CONNECTIONS_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Connections — Vodora",
  description: "Manage candidate connection requests and your network.",
};

export default async function RecruiterConnectionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    RECRUITER_CONNECTIONS_PATH,
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  const accountType = user ? await getAccountType(supabase, user) : null;

  if (accountType !== "recruiter") {
    redirect(getCandidateDashboardAccessDeniedRedirect());
  }

  if (!user) {
    redirect(getLoginRedirect(RECRUITER_CONNECTIONS_PATH));
  }

  return <ConnectionsPage role="recruiter" />;
}
