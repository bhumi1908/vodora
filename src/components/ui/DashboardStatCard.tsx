import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/Skeleton";

export type DashboardStatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  href?: string;
  isLoading?: boolean;
};

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
  isLoading = false,
}: DashboardStatCardProps) {
  const content = (
    <>
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      {isLoading ? (
        <Skeleton className="mb-1 h-9 w-16" />
      ) : (
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      )}
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">{content}</div>
  );
}

type DashboardStatGridProps = {
  children: ReactNode;
};

export function DashboardStatGrid({ children }: DashboardStatGridProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {children}
    </div>
  );
}
