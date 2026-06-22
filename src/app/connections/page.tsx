import { redirect } from "next/navigation";

import { ConnectionsPage } from "@/components/connections/ConnectionsPage";
import { getRecruiterDashboardAccessDeniedRedirect } from "@/lib/auth/access-denied";
import { getAccountType } from "@/lib/auth/account-type";
import {
  getLoginRedirect,
  getRouteProtectionRedirect,
} from "@/lib/auth/route-protection";
import { CANDIDATE_CONNECTIONS_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Connections — Vodora",
  description: "Manage your recruiter connections, requests, and network.",
};

export default async function CandidateConnectionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    CANDIDATE_CONNECTIONS_PATH,
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  const accountType = user ? await getAccountType(supabase, user) : null;

  if (accountType !== "candidate") {
    redirect(getRecruiterDashboardAccessDeniedRedirect());
  }

  if (!user) {
    redirect(getLoginRedirect(CANDIDATE_CONNECTIONS_PATH));
  }

  return <ConnectionsPage role="candidate" />;
}
