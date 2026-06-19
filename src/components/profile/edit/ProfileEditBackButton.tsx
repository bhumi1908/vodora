"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type ProfileEditBackButtonProps = {
  href: string;
  label?: string;
};

export function ProfileEditBackButton({
  href,
  label = "Back to profile",
}: ProfileEditBackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className="mb-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
      {label}
    </button>
  );
}
