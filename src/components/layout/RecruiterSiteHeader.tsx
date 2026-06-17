"use client";

import { Building2, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

export function RecruiterSiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <div className="flex min-w-0 items-center gap-6 lg:gap-10">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2"
              onClick={closeMobileMenu}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-semibold text-gray-900">Vodora</span>
                <span className="text-[10px] font-medium tracking-wide text-blue-600 uppercase">
                  For Recruiters
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-6 md:flex lg:gap-8">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 sm:gap-3 md:flex">
              <Link
                href="/"
                className="px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 sm:px-4"
              >
                For Candidates
              </Link>
              <Link
                href="/login?type=recruiter"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:px-4"
              >
                Log In
              </Link>
              <Link
                href="/signup/recruiter"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:px-5"
              >
                Start Free Trial
              </Link>
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
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                <Link
                  href="/"
                  className="block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  onClick={closeMobileMenu}
                >
                  For Candidates
                </Link>
                <Link
                  href="/login?type=recruiter"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  onClick={closeMobileMenu}
                >
                  Log In
                </Link>
                <Link
                  href="/signup/recruiter"
                  className="block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  onClick={closeMobileMenu}
                >
                  Start Free Trial
                </Link>
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
