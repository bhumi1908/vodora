"use client";

import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { RememberMeSection } from "@/components/settings/RememberMeSection";

type AccountSecuritySectionProps = {
  email: string;
  emailVerified: boolean;
  rememberMe: boolean;
  savedRememberMe: boolean;
  onRememberMeChange: (value: boolean) => void;
  onRememberMeSaved: (value: boolean) => void;
};

function SettingsSubsection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function AccountSecuritySection({
  email,
  emailVerified,
  rememberMe,
  savedRememberMe,
  onRememberMeChange,
  onRememberMeSaved,
}: AccountSecuritySectionProps) {
  return (
    <div className="space-y-10">
      <SettingsSubsection
        title="Email address"
        description="Your sign-in email and verification status."
      >
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-gray-200">
              <Mail className="h-4 w-4" />
            </span>
            <p className="truncate text-sm font-medium text-gray-900">{email}</p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {emailVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified
              </span>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-600/20">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Not verified
                </span>
                <Link
                  href="/verify-email"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Verify email
                </Link>
              </>
            )}
          </div>
        </div>
      </SettingsSubsection>

      <SettingsSubsection
        title="Change password"
        description="Update your password. Use a strong, unique password you don't use elsewhere."
      >
        <ResetPasswordForm
          mode="session"
          showHeading={false}
          redirectOnSuccess={false}
          showGeneratePassword
          compact
        />
      </SettingsSubsection>

      <SettingsSubsection
        title="Sign-in preference"
        description="Choose whether future sign-ins should keep you logged in longer."
      >
        <RememberMeSection
          embedded
          value={rememberMe}
          savedValue={savedRememberMe}
          onChange={onRememberMeChange}
          onSaved={onRememberMeSaved}
        />
      </SettingsSubsection>
    </div>
  );
}
