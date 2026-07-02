import Link from "next/link";

interface NavItemProps {
  readonly label: string;
  readonly href: string;
  readonly active?: boolean;
  readonly onClick?: () => void;
  readonly variant?: "link" | "button";
}

export function NavItem({
  label,
  href,
  active = false,
  onClick,
  variant = "link",
}: NavItemProps) {
  if (variant === "button") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="hidden rounded-md bg-[#1D8B8A] px-12 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#166F6E] active:bg-[#125E5D] lg:inline-block"
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-semibold uppercase tracking-widest transition-colors ${active
          ? "text-[#1D8B8A]"
          : "text-gray-800 hover:text-[#1D8B8A]"
        }`}
    >
      {label}
    </Link>
  );
}
