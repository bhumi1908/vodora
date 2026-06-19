"use client";

import { Briefcase, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import type { ResendVerificationApiResponse } from "@/lib/auth/types";

const RESEND_COOLDOWN_SECONDS = 60;

function EmailVerificationContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  async function handleResend() {
    if (!email) {
      setFormError("No email address found. Please register again.");
      return;
    }

    if (cooldownSeconds > 0) {
      return;
    }

    setFormError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = (await response.json()) as ResendVerificationApiResponse;

      if (!response.ok || !result.success) {
        setFormError(result.error ?? "Unable to resend verification email.");
        return;
      }

      setSuccessMessage("Verification email sent. Please check your inbox.");
      setCooldownSeconds(RESEND_COOLDOWN_SECONDS);

      const interval = window.setInterval(() => {
        setCooldownSeconds((seconds) => {
          if (seconds <= 1) {
            window.clearInterval(interval);
            return 0;
          }

          return seconds - 1;
        });
      }, 1000);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white p-8">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="mb-8 inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-600">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-semibold text-gray-900">Vodora</span>
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-10 w-10 text-blue-600" />
          </div>

          <h1 className="mb-3 text-3xl font-semibold text-gray-900">
            Verify Your Email
          </h1>
          <p className="mb-2 text-gray-600">
            We&apos;ve sent a verification link to your email address. Please
            check your inbox and click the link to verify your account.
          </p>
          {email ? (
            <p className="mb-8 text-sm font-medium text-gray-900">{email}</p>
          ) : (
            <p className="mb-8" />
          )}

          {formError ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {successMessage}
            </div>
          ) : null}

          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-700">
              Didn&apos;t receive the email? Check your spam folder or click the
              button below to resend.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResend}
            disabled={isSubmitting || cooldownSeconds > 0 || !email}
            className="mb-4 w-full rounded-lg bg-blue-600 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting
              ? "Sending..."
              : cooldownSeconds > 0
                ? `Resend in ${cooldownSeconds}s`
                : "Resend Verification Email"}
          </button>

          <button
            type="button"
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" });
              } catch {
                // Continue to login even if sign-out fails.
              }

              window.location.href = "/login";
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export function EmailVerificationPage() {
  return (
    <Suspense fallback={null}>
      <EmailVerificationContent />
    </Suspense>
  );
}
