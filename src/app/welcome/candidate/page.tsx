import { redirect } from "next/navigation";

import { CandidateWelcome } from "@/components/welcome/CandidateWelcome";
import {
  getWelcomeLoginRedirect,
  getWelcomePageRedirect,
} from "@/lib/auth/welcome-guard";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Welcome — Vodora",
  description: "Complete your professional profile on Vodora.",
};

export default async function CandidateWelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(getWelcomeLoginRedirect("candidate"));
  }

  const redirectTo = await getWelcomePageRedirect(supabase, user, "candidate");

  if (redirectTo) {
    redirect(redirectTo);
  }

  return <CandidateWelcome />;
}
