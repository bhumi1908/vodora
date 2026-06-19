"use client";

import { Briefcase, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { AuthInput } from "@/components/auth/shared/AuthInput";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import type { ForgotPasswordApiResponse } from "@/lib/auth/types";
import { getForgotPasswordFieldErrors } from "@/lib/auth/validation";
import { hasFieldErrors } from "@/lib/form/field-errors";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { errors, setErrors, clearField } = useFieldErrors<"email">();
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const fieldErrors = getForgotPasswordFieldErrors({ email });

    if (hasFieldErrors(fieldErrors)) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = (await response.json()) as ForgotPasswordApiResponse;

      if (!response.ok || !result.success) {
        setFormError(result.error ?? "Unable to send reset email.");
        return;
      }

      setIsSubmitted(true);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white p-8">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-600">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-semibold text-gray-900">Vodora</span>
        </Link>

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
                If an account exists for{" "}
                <span className="font-medium text-gray-900">{email}</span>, we
                sent a password reset link. The link expires in 1 hour.
              </p>
              <p className="mb-8 text-sm text-gray-500">
                Didn&apos;t receive it? Check your spam folder or try again in a
                few minutes.
              </p>
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
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-blue-600 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
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
