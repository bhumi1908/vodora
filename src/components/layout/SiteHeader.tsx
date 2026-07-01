"use client";

import { Briefcase, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { UserProfileMenu } from "@/components/layout/UserProfileMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  CANDIDATE_CONNECTIONS_PATH,
  CANDIDATE_FIND_CANDIDATES_PATH,
  CANDIDATE_FIND_RECRUITERS_PATH,
  CANDIDATE_JOBS_PATH,
  RECRUITER_CONNECTIONS_PATH,
  RECRUITER_DASHBOARD_PATH,
  RECRUITER_PROFILE_PATH,
  getDashboardPath,
} from "@/lib/auth/routes";
import { useAccountType } from "@/lib/auth/use-account-type";
import { useUserProfilePicture } from "@/lib/auth/use-user-profile-picture";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const sharedNavItems = [
  { label: "Search for Jobs", href: CANDIDATE_JOBS_PATH, prefetch: false },
  {
    label: "Find Candidates",
    href: CANDIDATE_FIND_CANDIDATES_PATH,
    prefetch: false,
  },
  {
    label: "Find Recruiters",
    href: CANDIDATE_FIND_RECRUITERS_PATH,
    prefetch: false,
  },
] as const;

function AuthButtons({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 sm:px-5"
        onClick={onNavigate}
      >
        Login
      </Link>
      <Link
        href="/signup"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:px-5"
        onClick={onNavigate}
      >
        Sign Up
      </Link>
    </>
  );
}

function MobileAuthButtons({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Link
        href="/login"
        className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        onClick={onNavigate}
      >
        Login
      </Link>
      <Link
        href="/signup"
        className="block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
        onClick={onNavigate}
      >
        Sign Up
      </Link>
    </>
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

  return { user, authLoading, setUser };
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const { user, authLoading, setUser } = useAuthUser();
  const accountType = useAccountType(user);
  const profilePictureUrl = useUserProfilePicture(user, accountType);
  const isLanding = pathname === "/";
  const profileHref =
    accountType === "recruiter" ? RECRUITER_PROFILE_PATH : "/my-profile";
  const accountTypeLoading = Boolean(user) && accountType === null;
  const dashboardHref = getDashboardPath(accountType ?? "candidate");
  const connectHref =
    accountType === "recruiter"
      ? RECRUITER_CONNECTIONS_PATH
      : CANDIDATE_CONNECTIONS_PATH;
  const appNavItems = [
    { label: "Dashboard", href: dashboardHref, prefetch: true },
    { label: "Connect", href: connectHref, prefetch: false },
    ...sharedNavItems,
  ];

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function isActive(path: string) {
    if (path === dashboardHref) {
      return (
        pathname === path ||
        pathname.startsWith(`${path}/`) ||
        (accountType === "recruiter" && pathname === "/recruiter")
      );
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  }

  const navLinkClass =
    "block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900";
  const navLinkActiveClass =
    "block rounded-lg px-3 py-2.5 text-sm font-medium bg-blue-50 text-blue-600 transition-colors hover:bg-blue-50";

  const desktopNavLinkClass = (href: string) =>
    `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      isActive(href)
        ? "bg-blue-50 text-blue-600"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  const showAuthActions = !authLoading;
  const isLoggedIn = Boolean(user);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2"
            onClick={closeMobileMenu}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900 sm:text-xl">
              Vodora
            </span>
          </Link>

          {!isLanding ? (
            <nav className="hidden items-center gap-1 md:flex">
              {appNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  prefetch={item.prefetch}
                  className={desktopNavLinkClass(item.href)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 sm:gap-3 md:flex">
              {showAuthActions ? (
                isLoggedIn && user ? (
                  accountTypeLoading ? (
                    <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-100" />
                  ) : (
                    <>
                      <NotificationBell />
                      <UserProfileMenu
                        user={user}
                        profileHref={profileHref}
                        profilePictureUrl={profilePictureUrl}
                        variant="desktop"
                        onSignOut={() => setUser(null)}
                      />
                    </>
                  )
                ) : (
                  <AuthButtons />
                )
              ) : (
                <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-100" />
              )}
            </div>

            <button
              type="button"
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 top-14 z-40 bg-black/20 sm:top-16 md:hidden"
            onClick={closeMobileMenu}
          />
          <div className="absolute right-0 left-0 z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-gray-200 bg-white shadow-lg sm:max-h-[calc(100dvh-4rem)] md:hidden">
            <nav className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6">
              {!isLanding ? (
                <div className="space-y-1">
                  {appNavItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      prefetch={item.prefetch}
                      className={
                        isActive(item.href) ? navLinkActiveClass : navLinkClass
                      }
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}

              <div
                className={`space-y-2 ${!isLanding ? "mt-4 border-t border-gray-100 pt-4" : ""}`}
              >
                {showAuthActions ? (
                  isLoggedIn && user ? (
                    accountTypeLoading ? (
                      <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
                    ) : (
                      <>
                        <div className="mb-2 flex justify-end">
                          <NotificationBell />
                        </div>
                        <UserProfileMenu
                          user={user}
                          profileHref={profileHref}
                          profilePictureUrl={profilePictureUrl}
                          variant="mobile"
                          onNavigate={closeMobileMenu}
                          onSignOut={() => setUser(null)}
                        />
                      </>
                    )
                  ) : (
                    <MobileAuthButtons onNavigate={closeMobileMenu} />
                  )
                ) : (
                  <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
                )}
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
