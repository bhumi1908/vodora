import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";
import { redirectIfAuthenticated } from "@/lib/auth/guest-page-guard";

export const metadata: Metadata = {
  title: "Candidate Sign in — Vodora",
  description: "Sign in to your Vodora candidate account",
};

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return <LoginForm />;
}
