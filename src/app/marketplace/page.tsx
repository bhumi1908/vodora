import { redirect } from "next/navigation";

import { getRecruiterDashboardAccessDeniedRedirect } from "@/lib/auth/access-denied";
import { getAccountType } from "@/lib/auth/account-type";
import {
  getLoginRedirect,
  getRouteProtectionRedirect,
} from "@/lib/auth/route-protection";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Connect — Vodora",
  description: "Connect with recruiters and candidates on Vodora.",
};

export default async function MarketplacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    "/marketplace",
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  const accountType = user ? await getAccountType(supabase, user) : null;

  if (accountType !== "candidate") {
    redirect(getRecruiterDashboardAccessDeniedRedirect());
  }

  if (!user) {
    redirect(getLoginRedirect("/marketplace"));
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-gray-900">Connect</h1>
      <p className="mt-2 text-gray-600">
        The marketplace is coming soon. Browse jobs or update your profile in
        the meantime.
      </p>
    </div>
  );
}
