import { redirect } from "next/navigation";

import { RecruiterWelcome } from "@/components/welcome/RecruiterWelcome";
import {
  getWelcomeLoginRedirect,
  getWelcomePageRedirect,
} from "@/lib/auth/welcome-guard";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Welcome — Vodora for Recruiters",
  description: "Set up your recruiter account on Vodora.",
};

export default async function RecruiterWelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(getWelcomeLoginRedirect("recruiter"));
  }

  const redirectTo = await getWelcomePageRedirect(supabase, user, "recruiter");

  if (redirectTo) {
    redirect(redirectTo);
  }

  return <RecruiterWelcome />;
}
