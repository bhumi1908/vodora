import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";
import { EMAIL_FEATURES_ENABLED } from "@/lib/auth/email-features";
import { redirectIfAuthenticated } from "@/lib/auth/guest-page-guard";

export const metadata: Metadata = {
  title: "Sign in — Vodora",
  description: "Sign in to your Vodora account",
};

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return <LoginForm emailFeaturesEnabled={EMAIL_FEATURES_ENABLED} />;
}
