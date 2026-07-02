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
      className="hidden items-center gap-1 rounded-lg bg-white px-1 py-1 shadow-sm lg:flex"
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
