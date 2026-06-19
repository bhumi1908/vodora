"use client";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AuthBrandLogo } from "@/components/auth/shared/AuthBrandLogo";

export function ResetPasswordSessionPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <AuthBrandLogo className="mb-8" />

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <ResetPasswordForm mode="session" />
        </div>
      </div>
    </div>
  );
}
