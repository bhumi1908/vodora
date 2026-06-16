"use client";

import { Briefcase, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const landingNavItems = [
  { type: "scroll" as const, label: "Features", id: "features" },
  { type: "scroll" as const, label: "For Candidates", id: "candidates" },
  { type: "scroll" as const, label: "For Recruiters", id: "recruiters" },
  { type: "link" as const, label: "Profiles", href: "/my-profile" },
  { type: "link" as const, label: "Pricing", href: "/pricing" },
  { type: "scroll" as const, label: "About", id: "about" },
];

const appNavItems = [
  { label: "Candidates", href: "/marketplace" },
  { label: "Search", href: "/search" },
  { label: "My Profile", href: "/my-profile" },
  { label: "Pricing", href: "/pricing" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const isLanding = pathname === "/";

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

  function scrollToSection(id: string) {
    closeMobileMenu();

    if (isLanding) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    router.push(`/#${id}`);
  }

  function isActive(path: string) {
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  const navLinkClass =
    "block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900";
  const navLinkActiveClass =
    "block rounded-lg px-3 py-2.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <div className="flex min-w-0 items-center gap-4 lg:gap-12">
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

            {isLanding ? (
              <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
                {landingNavItems.map((item) =>
                  item.type === "scroll" ? (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </nav>
            ) : (
              <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
                {appNavItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`text-sm font-medium transition-colors ${isActive(item.href) ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
            <div className="hidden items-center gap-1.5 sm:gap-2 lg:flex lg:gap-3">
              <Link
                href="/recruiters"
                className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 lg:px-4"
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="hidden xl:inline">I&apos;m a Recruiter</span>
                <span className="xl:hidden">Recruiter</span>
              </Link>
              <Link
                href="/login"
                className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 lg:px-5"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-blue-700 lg:px-5"
              >
                <span className="hidden sm:inline">Create Free Profile</span>
                <span className="sm:hidden">Sign Up</span>
              </Link>
            </div>

            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 lg:hidden"
            >
              Sign Up
            </Link>

            <button
              type="button"
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
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
            className="fixed inset-0 top-14 z-40 bg-black/20 sm:top-16 lg:hidden"
            onClick={closeMobileMenu}
          />
          <div className="absolute right-0 left-0 z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-gray-200 bg-white shadow-lg sm:max-h-[calc(100dvh-4rem)] lg:hidden">
            <nav className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6">
              <div className="space-y-1">
                {isLanding
                  ? landingNavItems.map((item) =>
                      item.type === "scroll" ? (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => scrollToSection(item.id)}
                          className={`${navLinkClass} w-full text-left`}
                        >
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={navLinkClass}
                          onClick={closeMobileMenu}
                        >
                          {item.label}
                        </Link>
                      ),
                    )
                  : appNavItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={
                          isActive(item.href) ? navLinkActiveClass : navLinkClass
                        }
                        onClick={closeMobileMenu}
                      >
                        {item.label}
                      </Link>
                    ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                <Link
                  href="/recruiters"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                  onClick={closeMobileMenu}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  I&apos;m a Recruiter
                </Link>
                <Link
                  href="/login"
                  className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  onClick={closeMobileMenu}
                >
                  Create Free Profile
                </Link>
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
