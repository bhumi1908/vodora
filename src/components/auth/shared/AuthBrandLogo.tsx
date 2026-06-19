import { Briefcase } from "lucide-react";
import Link from "next/link";

type AuthBrandLogoProps = {
  href?: string;
  className?: string;
};

/** Matches login-page logo: `h-9 w-9` blue mark + Lucide briefcase. */
export function AuthBrandLogo({ href = "/", className = "" }: AuthBrandLogoProps) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded bg-blue-600">
        <Briefcase className="h-4 w-4 text-white" aria-hidden="true" />
      </div>
      <span className="text-xl font-semibold text-gray-900">Vodora</span>
    </Link>
  );
}
