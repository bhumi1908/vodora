import { redirect } from "next/navigation";

import { NotificationsPageClient } from "@/components/notifications/NotificationsPageClient";
import {
  getLoginRedirect,
  getRouteProtectionRedirect,
} from "@/lib/auth/route-protection";
import { NOTIFICATIONS_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Notifications — Vodora",
  description: "View and manage your Vodora notifications.",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    NOTIFICATIONS_PATH,
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  if (!user) {
    redirect(getLoginRedirect(NOTIFICATIONS_PATH));
  }

  return <NotificationsPageClient />;
}
