import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ResetPasswordPage } from "@/components/auth/ResetPasswordPage";
import { ResetPasswordSessionPage } from "@/components/auth/ResetPasswordSessionPage";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Reset Password — Vodora",
  description: "Set a new password for your Vodora account",
};

type ResetPasswordRouteProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordRoute({
  searchParams,
}: ResetPasswordRouteProps) {
  const { token } = await searchParams;

  if (token?.trim()) {
    return <ResetPasswordPage />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/reset-password");
  }

  return <ResetPasswordSessionPage />;
}
