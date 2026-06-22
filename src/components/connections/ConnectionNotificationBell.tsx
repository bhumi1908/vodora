"use client";

import { Bell } from "lucide-react";
import Link from "next/link";

import {
  CANDIDATE_CONNECTIONS_PATH,
  RECRUITER_CONNECTIONS_PATH,
} from "@/lib/auth/routes";
import { useConnectionCountsQuery } from "@/lib/query/use-connection-queries";

type ConnectionNotificationBellProps = {
  role: "candidate" | "recruiter";
  className?: string;
};

export function ConnectionNotificationBell({
  role,
  className = "",
}: ConnectionNotificationBellProps) {
  const { data: counts } = useConnectionCountsQuery(role);
  const href =
    role === "candidate" ? CANDIDATE_CONNECTIONS_PATH : RECRUITER_CONNECTIONS_PATH;
  const pendingReceived = counts?.pendingReceived ?? 0;
  const badgeLabel =
    pendingReceived > 9 ? "9+" : pendingReceived > 0 ? String(pendingReceived) : null;

  return (
    <Link
      href={href}
      className={`relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 ${className}`}
      aria-label={
        pendingReceived > 0
          ? `${pendingReceived} connection request${pendingReceived === 1 ? "" : "s"} waiting`
          : "Connection notifications"
      }
    >
      <Bell className="h-5 w-5" />
      {badgeLabel ? (
        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          {badgeLabel}
        </span>
      ) : null}
    </Link>
  );
}
