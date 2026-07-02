import Link from "next/link";

import { isActiveNavHref, type NavItemConfig } from "./constants";

interface MobileMenuProps {
  readonly items: NavItemConfig[];
  readonly activeHref: string;
  readonly onClose: () => void;
}

export function MobileMenu({ items, activeHref, onClose }: MobileMenuProps) {
  const visibleItems = items.filter((item) => !item.hidden);
  const linkItems = visibleItems.filter((item) => item.variant !== "button");
  const buttonItems = visibleItems.filter((item) => item.variant === "button");

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 top-16 z-40 bg-black/50"
        onClick={onClose}
      />
      <div className="absolute right-0 left-0 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto bg-black shadow-2xl lg:hidden">
        <nav
          aria-label="Mobile navigation"
          className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6"
        >
          <div className="space-y-1">
            {linkItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`block rounded-md px-4 py-3 text-sm font-semibold uppercase tracking-widest transition-colors ${isActiveNavHref(item.href, activeHref)
                    ? "text-[#1D8B8A]"
                    : "text-white hover:text-[#1D8B8A]"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {buttonItems.length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-6">
              {buttonItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="block w-full rounded-md bg-[#1D8B8A] px-4 py-3 text-center text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#166F6E] active:bg-[#125E5D]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </nav>
      </div>
    </>
  );
}
