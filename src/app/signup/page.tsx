import type { Metadata } from "next";

import { SignupChooserPage } from "@/components/auth/SignupChooserPage";
import { redirectIfAuthenticated } from "@/lib/auth/guest-page-guard";

export const metadata: Metadata = {
  title: "Join Vodora",
  description: "Choose how you want to use Vodora — candidate or recruiter",
};

export default async function SignupRoute() {
  await redirectIfAuthenticated();
  return <SignupChooserPage />;
}
