import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";
import { redirectIfAuthenticated } from "@/lib/auth/guest-page-guard";

export const metadata: Metadata = {
  title: "Sign in — Vodora",
  description: "Sign in to your Vodora account",
};

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return <LoginForm />;
}
