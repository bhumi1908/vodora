import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ForgotPasswordPage } from "@/components/auth/ForgotPasswordPage";
import { EMAIL_FEATURES_ENABLED } from "@/lib/auth/email-features";
import { redirectIfAuthenticated } from "@/lib/auth/guest-page-guard";

export const metadata: Metadata = {
  title: "Forgot Password — Vodora",
  description: "Request a password reset link for your Vodora account",
};

export default async function ForgotPasswordRoute() {
  if (!EMAIL_FEATURES_ENABLED) {
    redirect("/login");
  }

  await redirectIfAuthenticated();
  return <ForgotPasswordPage />;
}
