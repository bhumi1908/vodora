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
        className="hidden rounded-md bg-[#1D8B8A] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#166F6E] active:bg-[#125E5D] lg:inline-block xl:px-8 xl:tracking-widest"
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-2 py-1.5 text-sm font-semibold uppercase tracking-wide transition-colors xl:px-3 xl:tracking-widest ${active
        ? "text-[#1D8B8A]"
        : "text-black hover:text-[#1D8B8A]"
        }`}
    >
      {label}
    </Link>
  );
}
