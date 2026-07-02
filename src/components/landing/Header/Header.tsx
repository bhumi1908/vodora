"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AnimateIn } from "@/components/landing/shared/AnimateIn";
import { MobileMenu } from "./MobileMenu";
import { Navigation } from "./Navigation";
import { NAV_ITEMS } from "./constants";

export function LandingHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const prevPathnameRef = useRef(pathname);

  if (prevPathnameRef.current !== pathname) {
    prevPathnameRef.current = pathname;
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 200);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  const headerBg = mobileMenuOpen
    ? "bg-black border-b border-white/10"
    : scrolled
      ? "bg-black/75 backdrop-blur-md backdrop-saturate-150 border-b border-white/10 shadow-lg shadow-black/25"
      : "bg-transparent";

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${headerBg}`}>
      <AnimateIn immediate variant="fade-in" duration={500}>
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-fit items-center justify-between gap-4 py-4 sm:py-5">
            <Link
              href="/"
              aria-label="Vodora home"
              className="shrink-0"
              onClick={closeMobileMenu}
            >
              <Image
                src="/Images/logo-svg.svg"
                alt="Vodora"
                width={176}
                height={28}
                priority
                className="h-[20px] w-auto lg:h-[28px]"
              />
            </Link>

            <div className="flex min-w-0 items-center gap-3">
              <Navigation
                items={NAV_ITEMS}
                activeHref={pathname}
                onItemClick={closeMobileMenu}
              />

              <button
                type="button"
                className="rounded-md p-2 text-white transition-colors hover:bg-white/10 lg:hidden"
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
      </AnimateIn>

      {mobileMenuOpen && (
        <MobileMenu
          items={NAV_ITEMS}
          activeHref={pathname}
          onClose={closeMobileMenu}
        />
      )}
    </header>
  );
}
