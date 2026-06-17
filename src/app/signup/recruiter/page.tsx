import type { Metadata } from "next";

import { RecruiterSignupPage } from "@/components/auth/RecruiterSignupPage";
import { redirectIfAuthenticated } from "@/lib/auth/guest-page-guard";

export const metadata: Metadata = {
  title: "Create Recruiter Account — Vodora",
  description: "Create your Vodora recruiter account and join the trusted hiring network",
};

export default async function RecruiterSignupRoute() {
  await redirectIfAuthenticated();
  return <RecruiterSignupPage />;
}
