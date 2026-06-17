import type { Metadata } from "next";

import { CandidateSignupPage } from "@/components/auth/CandidateSignupPage";
import { redirectIfAuthenticated } from "@/lib/auth/guest-page-guard";

export const metadata: Metadata = {
  title: "Create Candidate Account — Vodora",
  description: "Create your Vodora candidate account and build your professional reputation",
};

export default async function CandidateSignupRoute() {
  await redirectIfAuthenticated();
  return <CandidateSignupPage />;
}
