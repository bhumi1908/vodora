"use client";

import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

const AUTH_ROUTE_PREFIXES = ["/login", "/signup"];

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
      {!isRecruitersLanding(pathname) ? <SiteHeader /> : null}
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
