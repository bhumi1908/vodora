import { redirect } from "next/navigation";

import { MyProfilePageClient } from "@/components/profile/MyProfilePageClient";
import { getRecruiterDashboardAccessDeniedRedirect } from "@/lib/auth/access-denied";
import { getAccountType } from "@/lib/auth/account-type";
import {
  getLoginRedirect,
  getRouteProtectionRedirect,
} from "@/lib/auth/route-protection";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "My Profile — Vodora",
  description: "View and manage your Vodora profile.",
};

export default async function MyProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    "/my-profile",
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  const accountType = user ? await getAccountType(supabase, user) : null;

  if (accountType !== "candidate") {
    redirect(getRecruiterDashboardAccessDeniedRedirect());
  }

  if (!user) {
    redirect(getLoginRedirect("/my-profile"));
  }

  return <MyProfilePageClient />;
}
