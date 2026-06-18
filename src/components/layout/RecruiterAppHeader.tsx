"use client";

import type { User } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Bell,
  Bookmark,
  Briefcase,
  LayoutGrid,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { RecruiterUserProfileMenu } from "@/components/layout/RecruiterUserProfileMenu";
import {
  RECRUITER_DASHBOARD_PATH,
  RECRUITER_SAVED_PATH,
  RECRUITER_SEARCH_PATH,
} from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/client";

const recruiterNavItems = [
  {
    label: "Dashboard",
    href: RECRUITER_DASHBOARD_PATH,
    icon: LayoutGrid,
    isActive: (pathname: string) =>
      pathname === RECRUITER_DASHBOARD_PATH || pathname === "/recruiter",
  },
  {
    label: "Find Candidates",
    href: RECRUITER_SEARCH_PATH,
    icon: Search,
    isActive: (pathname: string) =>
      pathname === RECRUITER_SEARCH_PATH ||
      pathname.startsWith("/recruiter/candidates/"),
  },
  {
    label: "Saved Candidates",
    href: RECRUITER_SAVED_PATH,
    icon: Bookmark,
    isActive: (pathname: string) => pathname === RECRUITER_SAVED_PATH,
  },
  {
    label: "My Profile",
    href: "/settings",
    icon: UserRound,
    isActive: (pathname: string) => pathname.startsWith("/settings"),
  },
] as const;

function AuthButtons({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Link
        href="/login?redirect=/recruiter/dashboard"
        className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
        onClick={onNavigate}
      >
        Login
      </Link>
      <Link
        href="/signup/recruiter"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
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

function useRecruiterCompanyName(user: User | null) {
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCompanyName(null);
      return;
    }

    let cancelled = false;
    const supabase = createClient();
    const userId = user.id;

    async function loadCompanyName() {
      const { data: recruiter } = await supabase
        .from("recruiters")
        .select("company_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled || !recruiter?.company_id) {
        if (!cancelled) {
          setCompanyName(null);
        }
        return;
      }

      const { data: company } = await supabase
        .from("companies")
        .select("name")
        .eq("id", recruiter.company_id)
        .maybeSingle();

      if (!cancelled) {
        setCompanyName(company?.name ?? null);
      }
    }

    void loadCompanyName();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return companyName;
}

export function RecruiterAppHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const { user, authLoading, setUser } = useAuthUser();
  const companyName = useRecruiterCompanyName(user);

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

  const desktopNavLinkClass = (active: boolean) =>
    `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? "bg-blue-50 text-blue-600"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  const mobileNavLinkClass = (active: boolean) =>
    `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      active
        ? "bg-blue-50 text-blue-600"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  const showAuthActions = !authLoading;
  const isLoggedIn = Boolean(user);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4 sm:h-16">
          <div className="flex min-w-0 flex-1 items-center gap-6 lg:gap-10">
            <Link
              href={RECRUITER_DASHBOARD_PATH}
              className="flex shrink-0 items-center gap-2"
              onClick={closeMobileMenu}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-semibold text-gray-900 sm:text-xl">
                  Vodora
                </span>
                <span className="text-[10px] font-semibold tracking-wide text-blue-600 uppercase">
                  Recruiter
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {recruiterNavItems.map(({ label, href, icon: Icon, isActive }) => (
                <Link
                  key={label}
                  href={href}
                  className={desktopNavLinkClass(isActive(pathname))}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 md:flex lg:gap-3">
              {showAuthActions && isLoggedIn ? (
                <>
                  <Link
                    href="/"
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Switch to Candidate
                  </Link>
                  <button
                    type="button"
                    disabled
                    title="Notifications — coming soon"
                    className="relative rounded-lg p-2 text-gray-500 opacity-60"
                    aria-label="Notifications — coming soon"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                  </button>
                  {user ? (
                    <RecruiterUserProfileMenu
                      user={user}
                      companyName={companyName}
                      onSignOut={() => setUser(null)}
                    />
                  ) : null}
                </>
              ) : showAuthActions ? (
                <AuthButtons />
              ) : (
                <div className="h-9 w-32 animate-pulse rounded-lg bg-gray-100" />
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
              <div className="space-y-1">
                {recruiterNavItems.map(({ label, href, icon: Icon, isActive }) => (
                  <Link
                    key={label}
                    href={href}
                    className={mobileNavLinkClass(isActive(pathname))}
                    onClick={closeMobileMenu}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700"
                  onClick={closeMobileMenu}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Switch to Candidate
                </Link>

                {showAuthActions ? (
                  isLoggedIn && user ? (
                    <RecruiterUserProfileMenu
                      user={user}
                      companyName={companyName}
                      variant="mobile"
                      onNavigate={closeMobileMenu}
                      onSignOut={() => setUser(null)}
                    />
                  ) : (
                    <AuthButtons onNavigate={closeMobileMenu} />
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
