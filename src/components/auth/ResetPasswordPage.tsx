"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { AuthBrandLogo } from "@/components/auth/shared/AuthBrandLogo";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { EMAIL_FEATURES_ENABLED } from "@/lib/auth/email-features";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="mb-3 text-3xl font-semibold text-gray-900">
          Invalid reset link
        </h1>
        <p className="mb-6 text-gray-600">
          This password reset link is missing or invalid.
          {EMAIL_FEATURES_ENABLED
            ? " Request a new link from the forgot password page."
            : " Sign in and change your password from your account menu."}
        </p>
        <Link
          href={EMAIL_FEATURES_ENABLED ? "/forgot-password" : "/login"}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {EMAIL_FEATURES_ENABLED ? "Request a new link" : "Go to sign in"}
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm mode="token" token={token} />;
}

export function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white p-8">
      <div className="w-full max-w-md">
        <AuthBrandLogo className="mb-8" />

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <Suspense fallback={null}>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
