import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Candidate Sign in — Vodora",
  description: "Sign in to your Vodora candidate account",
};

export default function LoginPage() {
  return <LoginForm />;
}