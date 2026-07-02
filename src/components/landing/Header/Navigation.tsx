import { NavItem } from "./NavItem";
import { isActiveNavHref, type NavItemConfig } from "./constants";

interface NavigationProps {
  readonly items: NavItemConfig[];
  readonly activeHref: string;
  readonly onItemClick?: () => void;
}

export function Navigation({ items, activeHref, onItemClick }: NavigationProps) {
  const visibleItems = items.filter((item) => !item.hidden);

  return (
    <nav
      aria-label="Main navigation"
      className="hidden min-w-0 shrink items-center gap-0.5 rounded-lg bg-white px-1 py-1 shadow-sm lg:flex xl:gap-1"
    >
      {visibleItems.map((item) => (
        <NavItem
          key={item.href}
          label={item.label}
          href={item.href}
          active={isActiveNavHref(item.href, activeHref)}
          onClick={onItemClick}
          variant={item.variant}
        />
      ))}
    </nav>
  );
}
