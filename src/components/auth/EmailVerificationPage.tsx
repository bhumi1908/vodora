"use client";

import { Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import { AuthBrandLogo } from "@/components/auth/shared/AuthBrandLogo";
import type { ResendVerificationApiResponse } from "@/lib/auth/types";

const RESEND_COOLDOWN_SECONDS = 60;

function EmailVerificationContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";
  const justRegistered = searchParams.get("pending") === "1";
  const isRecruiterLogin = searchParams.get("type") === "recruiter";
  const loginHref = isRecruiterLogin ? "/login?type=recruiter" : "/login";
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    justRegistered ? "Verification email sent. Please check your inbox." : "",
  );
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const startCooldown = useCallback((seconds: number) => {
    setCooldownSeconds(seconds);
  }, []);

  useEffect(() => {
    if (justRegistered) {
      startCooldown(RESEND_COOLDOWN_SECONDS);
    }
  }, [justRegistered, startCooldown]); 

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setCooldownSeconds((seconds) => (seconds <= 1 ? 0 : seconds - 1));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [cooldownSeconds > 0]);

  function handleResend() {
    if (!email) {
      setFormError("No email address found. Please register again.");
      return;
    }

    if (cooldownSeconds > 0) {
      return;
    }

    setFormError("");
    setSuccessMessage("Verification email sent. Please check your inbox.");
    startCooldown(RESEND_COOLDOWN_SECONDS);

    void fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then(async (response) => {
        if (response.ok) {
          return;
        }

        const result = (await response.json()) as ResendVerificationApiResponse;
        setSuccessMessage("");

        if (response.status === 429) {
          const retryAfter = Number(response.headers.get("Retry-After"));
          startCooldown(
            Number.isFinite(retryAfter) && retryAfter > 0
              ? retryAfter
              : RESEND_COOLDOWN_SECONDS,
          );
        }

        setFormError(result.error ?? "Unable to resend verification email.");
      })
      .catch(() => {
        // Email may still be sending in the background.
      });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4 py-6 sm:px-6">
      <div className="w-full max-w-md text-center">
        <AuthBrandLogo className="mb-6" />

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
            disabled={cooldownSeconds > 0 || !email}
            className="mb-4 w-full rounded-lg bg-blue-600 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {cooldownSeconds > 0
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

              window.location.href = loginHref;
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
