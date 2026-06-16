import { Building2 } from "lucide-react";
import Link from "next/link";

interface VodoraLogoProps {
  href?: string;
  variant?: "default" | "recruiter";
  className?: string;
}

export function VodoraLogo({
  href = "/",
  variant = "default",
  className = "",
}: VodoraLogoProps) {
  if (variant === "recruiter") {
    return (
      <Link href={href} className={`flex items-center gap-2 ${className}`}>
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
    );
  }

  return (
    <Link href={href} className={`text-xl font-bold text-blue-600 ${className}`}>
      Vodora
    </Link>
  );
}
