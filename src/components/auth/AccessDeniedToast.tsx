"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

import { showAccessDeniedToast } from "@/lib/auth-toast";
import {
  ACCESS_DENIED_PARAM,
  isAccessDeniedReason,
} from "@/lib/auth/access-denied";

function AccessDeniedToastContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) {
      return;
    }

    const reason = searchParams.get(ACCESS_DENIED_PARAM);

    if (!isAccessDeniedReason(reason)) {
      return;
    }

    shownRef.current = true;
    showAccessDeniedToast(reason);

    const params = new URLSearchParams(searchParams.toString());
    params.delete(ACCESS_DENIED_PARAM);
    const queryString = params.toString();

    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  }, [pathname, router, searchParams]);

  return null;
}

export function AccessDeniedToast() {
  return (
    <Suspense fallback={null}>
      <AccessDeniedToastContent />
    </Suspense>
  );
}
