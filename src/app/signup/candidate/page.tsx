import type { Metadata } from "next";

import { CandidateSignupPage } from "@/components/auth/CandidateSignupPage";

export const metadata: Metadata = {
  title: "Create Candidate Account — Vodora",
  description: "Create your Vodora candidate account and build your professional reputation",
};

export default function CandidateSignupRoute() {
  return <CandidateSignupPage />;
}
