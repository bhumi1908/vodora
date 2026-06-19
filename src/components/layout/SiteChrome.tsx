"use client";

import { usePathname } from "next/navigation";

import { RecruiterAppHeader } from "@/components/layout/RecruiterAppHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { isRecruiterAppRoute } from "@/lib/auth/routes";

const AUTH_ROUTE_PREFIXES = ["/login", "/signup", "/welcome", "/forgot-password"];

function isAuthRoute(pathname: string) {
  return AUTH_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isRecruitersLanding(pathname: string) {
  return pathname === "/recruiters";
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isAuthRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!isRecruitersLanding(pathname) ? (
        isRecruiterAppRoute(pathname) ? (
          <RecruiterAppHeader />
        ) : (
          <SiteHeader />
        )
      ) : null}
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
