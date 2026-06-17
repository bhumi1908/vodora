import type { Metadata } from "next";

import { EmailVerificationPage } from "@/components/auth/EmailVerificationPage";

export const metadata: Metadata = {
  title: "Verify Your Email — Vodora",
  description: "Check your inbox for a verification link to activate your Vodora account",
};

export default function VerifyEmailRoute() {
  return <EmailVerificationPage />;
}
