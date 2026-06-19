"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";

import { AuthBrandLogo } from "@/components/auth/shared/AuthBrandLogo";
import { AuthInput } from "@/components/auth/shared/AuthInput";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import type { ForgotPasswordApiResponse } from "@/lib/auth/types";
import { getForgotPasswordFieldErrors } from "@/lib/auth/validation";
import { hasFieldErrors } from "@/lib/form/field-errors";

const RESEND_COOLDOWN_SECONDS = 60;

async function sendResetEmail(
  email: string,
): Promise<{ ok: true } | { ok: false; error?: string; retryAfterSeconds?: number }> {
  try {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = (await response.json()) as ForgotPasswordApiResponse;

    if (response.ok && result.success) {
      return { ok: true };
    }

    const retryAfter = Number(response.headers.get("Retry-After"));

    return {
      ok: false,
      error: result.error,
      retryAfterSeconds:
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
    };
  } catch {
    return { ok: false };
  }
}

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email")?.trim() ?? "";
  const [email, setEmail] = useState(emailFromQuery);
  const { errors, setErrors, clearField } = useFieldErrors<"email">();
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const startCooldown = useCallback((seconds: number) => {
    setCooldownSeconds(seconds);
  }, []);

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const trimmedEmail = email.trim();
    const fieldErrors = getForgotPasswordFieldErrors({ email: trimmedEmail });

    if (hasFieldErrors(fieldErrors)) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitted(true);
    setSuccessMessage("Reset email sent. Please check your inbox.");
    startCooldown(RESEND_COOLDOWN_SECONDS);

    void sendResetEmail(trimmedEmail).then((result) => {
      if (result.ok) {
        return;
      }

      if (result.retryAfterSeconds) {
        setSuccessMessage("");
        startCooldown(result.retryAfterSeconds);
        setFormError(result.error ?? "Too many requests. Please try again later.");
      }
    });
  }

  function handleResend() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setFormError("No email address found. Please go back and enter your email.");
      return;
    }

    if (cooldownSeconds > 0) {
      return;
    }

    setFormError("");
    setSuccessMessage("Reset email sent. Please check your inbox.");
    startCooldown(RESEND_COOLDOWN_SECONDS);

    void sendResetEmail(trimmedEmail).then((result) => {
      if (result.ok) {
        return;
      }

      setSuccessMessage("");

      if (result.retryAfterSeconds) {
        startCooldown(result.retryAfterSeconds);
      }

      setFormError(result.error ?? "Unable to send reset email. Please try again.");
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white p-8">
      <div className="w-full max-w-md">
        <AuthBrandLogo className="mb-8" />

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {isSubmitted ? (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                <Mail className="h-10 w-10 text-blue-600" />
              </div>
              <h1 className="mb-3 text-3xl font-semibold text-gray-900">
                Check your email
              </h1>
              <p className="mb-2 text-gray-600">
                If an account exists for this address, we sent a password reset
                link. The link expires in 1 hour.
              </p>
              {email.trim() ? (
                <p className="mb-8 text-sm font-medium text-gray-900">
                  {email.trim()}
                </p>
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
                  Didn&apos;t receive the email? Check your spam folder or click
                  the button below to resend.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResend}
                disabled={cooldownSeconds > 0 || !email.trim()}
                className="mb-4 w-full rounded-lg bg-blue-600 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {cooldownSeconds > 0
                  ? `Resend in ${cooldownSeconds}s`
                  : "Resend Reset Email"}
              </button>

              <Link
                href="/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="mb-2 text-3xl font-semibold text-gray-900">
                  Forgot password?
                </h1>
                <p className="text-gray-600">
                  Enter your email and we&apos;ll send you a link to reset your
                  password.
                </p>
              </div>

              {formError ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <AuthInput
                  id="email"
                  label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearField("email");
                    setFormError("");
                  }}
                  placeholder="you@example.com"
                  icon={<Mail className="h-5 w-5" />}
                  error={errors.email}
                />

                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Send Reset Link
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
