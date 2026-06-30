"use client";

import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { RecruiterAppHeader } from "@/components/layout/RecruiterAppHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ConnectionRealtimeSync } from "@/components/connections/ConnectionRealtimeSync";
import { JobApplicationRealtimeSync } from "@/components/jobs/JobApplicationRealtimeSync";
import { NotificationRealtimeSync } from "@/components/notifications/NotificationRealtimeSync";
import { useAccountType } from "@/lib/auth/use-account-type";
import { isRecruiterAppRoute } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/client";

const CHROMELESS_ROUTE_PREFIXES = [
  "/login",
  "/signup",
  "/welcome",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/reference/respond",
];

function isChromelessRoute(pathname: string) {
  return CHROMELESS_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isRecruitersLanding(pathname: string) {
  return pathname === "/recruiters";
}

const ACCOUNT_AWARE_ROUTE_PREFIXES = [
  "/feedback",
  "/settings",
  "/notifications",
];

function isAccountAwareRoute(pathname: string) {
  return ACCOUNT_AWARE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, authLoading };
}

function ChromeHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center sm:h-16">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-100" />
        </div>
      </div>
    </header>
  );
}

function ChromeHeader() {
  const pathname = usePathname();

  if (isRecruitersLanding(pathname)) {
    return null;
  }

  if (isRecruiterAppRoute(pathname)) {
    return <RecruiterAppHeader />;
  }

  if (isAccountAwareRoute(pathname)) {
    return <AccountAwareChromeHeader />;
  }

  return <SiteHeader />;
}

function AccountAwareChromeHeader() {
  const { user, authLoading } = useAuthUser();
  const accountType = useAccountType(user);

  if (user) {
    if (authLoading || accountType === null) {
      return <ChromeHeaderSkeleton />;
    }

    if (accountType === "recruiter") {
      return <RecruiterAppHeader />;
    }
  }

  return <SiteHeader />;
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, authLoading } = useAuthUser();
  const accountType = useAccountType(user);
  const realtimeRole =
    isRecruiterAppRoute(pathname) ||
    (pathname === "/" && accountType === "recruiter") ||
    (isAccountAwareRoute(pathname) && accountType === "recruiter")
      ? "recruiter"
      : "candidate";

  if (isChromelessRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!authLoading && user ? (
        <>
          <ConnectionRealtimeSync role={realtimeRole} />
          <JobApplicationRealtimeSync role={realtimeRole} />
          <NotificationRealtimeSync />
        </>
      ) : null}
      <ChromeHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
