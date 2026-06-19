"use client";

import { Briefcase, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

import { CandidateBrandPanel } from "@/components/auth/CandidateBrandPanel";
import { AuthInput } from "@/components/auth/shared/AuthInput";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import {
  showEmailVerifiedToast,
  showLoginSuccessToast,
  showPasswordResetSuccessToast,
  showRegistrationSuccessToast,
} from "@/lib/auth-toast";
import type { LoginApiResponse } from "@/lib/auth/types";
import { getLoginFieldErrors } from "@/lib/auth/validation";
import { hasFieldErrors } from "@/lib/form/field-errors";

function buildForgotPasswordHref(email: string): string {
  const trimmed = email.trim();
  if (!trimmed) {
    return "/forgot-password";
  }

  return `/forgot-password?${new URLSearchParams({ email: trimmed }).toString()}`;
}

type LoginFormContentProps = {
  emailFeaturesEnabled: boolean;
};

function LoginFormContent({ emailFeaturesEnabled }: LoginFormContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const justVerified = searchParams.get("verified") === "1";
  const passwordReset = searchParams.get("reset") === "1";
  const authCallbackFailed = searchParams.get("error") === "auth_callback_failed";
  const isRecruiterLogin = searchParams.get("type") === "recruiter";
  const redirectAfterLogin = searchParams.get("redirect");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const { errors, setErrors, clearField } = useFieldErrors<"email" | "password">();
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (justVerified) {
      showEmailVerifiedToast();
    }
  }, [justVerified]);

  useEffect(() => {
    if (passwordReset) {
      showPasswordResetSuccessToast();
    }
  }, [passwordReset]);

  useEffect(() => {
    if (justRegistered) {
      showRegistrationSuccessToast();
    }
  }, [justRegistered]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const fieldErrors = getLoginFieldErrors({
      email,
      password,
      isRecruiterLogin,
    });

    if (hasFieldErrors(fieldErrors)) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
          ...(isRecruiterLogin ? { accountType: "recruiter" as const } : {}),
          ...(redirectAfterLogin ? { redirect: redirectAfterLogin } : {}),
        }),
      });

      const result = (await response.json()) as LoginApiResponse;

      if (!response.ok || !result.success) {
        if (result.needsEmailVerification && result.redirectTo) {
          const verifyUrl = new URL(result.redirectTo, window.location.origin);
          if (isRecruiterLogin) {
            verifyUrl.searchParams.set("type", "recruiter");
          }
          router.push(`${verifyUrl.pathname}?${verifyUrl.searchParams.toString()}`);
          return;
        }

        setFormError(result.error ?? "Unable to sign in.");
        return;
      }

      showLoginSuccessToast();
      router.push(result.redirectTo ?? "/");
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <CandidateBrandPanel />

      <div className="flex flex-1 items-center justify-center bg-white p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-blue-600">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Vodora</span>
            </Link>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="mb-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-600 sm:text-base">
              {isRecruiterLogin
                ? "Sign in to your Vodora recruiter account"
                : "Sign in to your Vodora candidate account"}
            </p>
          </div>

          {justVerified ? (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Your email has been verified. Sign in with your email and password
              to continue.
            </div>
          ) : null}

          {justRegistered ? (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Account created. Sign in with the email and password you just used.
            </div>
          ) : null}

          {authCallbackFailed ? (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Email verification failed or the link has expired. Try signing in or
              request a new verification email.
            </div>
          ) : null}

          {formError ? (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <AuthInput
              id="email"
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearField("email");
                setFormError("");
              }}
              placeholder={isRecruiterLogin ? "you@company.com" : "you@example.com"}
              hint={
                isRecruiterLogin
                  ? "Must be a company email address"
                  : undefined
              }
              icon={<Mail className="h-5 w-5" />}
              error={errors.email}
            />

            <AuthInput
              id="password"
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearField("password");
                setFormError("");
              }}
              placeholder="••••••••"
              icon={<Lock className="h-5 w-5" />}
              error={errors.password}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              {emailFeaturesEnabled ? (
                <Link
                  href={buildForgotPasswordHref(email)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href={isRecruiterLogin ? "/signup/recruiter" : "/signup/candidate"}
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

type CandidateLoginPageProps = {
  emailFeaturesEnabled?: boolean;
};

export function CandidateLoginPage({
  emailFeaturesEnabled = false,
}: CandidateLoginPageProps) {
  return (
    <Suspense fallback={null}>
      <LoginFormContent emailFeaturesEnabled={emailFeaturesEnabled} />
    </Suspense>
  );
}
