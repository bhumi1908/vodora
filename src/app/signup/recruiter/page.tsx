import type { Metadata } from "next";

import { RecruiterSignupPage } from "@/components/auth/RecruiterSignupPage";

export const metadata: Metadata = {
  title: "Create Recruiter Account — Vodora",
  description: "Create your Vodora recruiter account and join the trusted hiring network",
};

export default function RecruiterSignupRoute() {
  return <RecruiterSignupPage />;
}