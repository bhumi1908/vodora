import Link from "next/link";

interface NavItemProps {
  readonly label: string;
  readonly href: string;
  readonly active?: boolean;
  readonly onClick?: () => void;
}

export function NavItem({ label, href, active = false, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-semibold uppercase tracking-widest transition-colors ${
        active
          ? "text-[#1D8B8A]"
          : "text-gray-800 hover:text-[#1D8B8A]"
      }`}
    >
      {label}
    </Link>
  );
}
