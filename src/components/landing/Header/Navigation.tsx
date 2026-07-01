import Link from "next/link";
import { NavItem } from "./NavItem";
import type { NavItemConfig } from "./constants";

interface NavigationProps {
  readonly items: NavItemConfig[];
  readonly activeHref: string;
  readonly onItemClick?: () => void;
}

function isActiveHref(itemHref: string, activeHref: string): boolean {
  if (itemHref === "/") return activeHref === "/";
  return activeHref === itemHref || activeHref.startsWith(`${itemHref}/`);
}

export function Navigation({ items, activeHref, onItemClick }: NavigationProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="hidden items-center gap-1 rounded-lg bg-white pl-6 pr-1.5 py-1 shadow-sm md:flex"
    >
      {items.map((item) => (
        <NavItem
          key={item.href}
          label={item.label}
          href={item.href}
          active={isActiveHref(item.href, activeHref)}
          onClick={onItemClick}
        />
      ))}

      <Link
        href="/signup"
        className="hidden rounded-md bg-[#1D8B8A] px-12 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#166F6E] active:bg-[#125E5D] md:inline-block"
      >
        Sign Up
      </Link>
    </nav>
  );
}
