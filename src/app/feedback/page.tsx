import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FeedbackPage } from "@/components/feedback/FeedbackPage";
import {
  getLoginRedirect,
  getRouteProtectionRedirect,
} from "@/lib/auth/route-protection";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Feedback — Vodora",
  description: "Share your feedback and help shape the future of Vodora.",
};

export default async function FeedbackRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    "/feedback",
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  if (!user) {
    redirect(getLoginRedirect("/feedback"));
  }

  const { data: existing } = await supabase
    .from("user_feedback")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <FeedbackPage
      alreadySubmitted={Boolean(existing)}
      userEmail={user.email ?? ""}
    />
  );
}
