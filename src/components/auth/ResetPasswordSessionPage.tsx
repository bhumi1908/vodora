"use client";

import { Briefcase } from "lucide-react";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export function ResetPasswordSessionPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-600">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-semibold text-gray-900">Vodora</span>
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <ResetPasswordForm mode="session" />
        </div>
      </div>
    </div>
  );
}
