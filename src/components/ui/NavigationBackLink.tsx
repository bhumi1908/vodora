"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type NavigationBackLinkProps = {
  fallbackHref: string;
  label?: string;
  className?: string;
};

const defaultClassName =
  "inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700";

function canNavigateBack(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const idx = (window.history.state as { idx?: number } | null)?.idx;
  if (typeof idx === "number") {
    return idx > 0;
  }

  return window.history.length > 1;
}

export function NavigationBackLink({
  fallbackHref,
  label = "Back",
  className = defaultClassName,
}: NavigationBackLinkProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (canNavigateBack()) {
          router.back();
          return;
        }

        router.push(fallbackHref);
      }}
      className={className}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
      {label}
    </button>
  );
}
