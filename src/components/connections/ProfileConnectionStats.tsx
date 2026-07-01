"use client";

import { Users } from "lucide-react";
import Link from "next/link";

import {
  CANDIDATE_CONNECTIONS_PATH,
  RECRUITER_CONNECTIONS_PATH,
} from "@/lib/auth/routes";
import { useConnectionCountsQuery } from "@/lib/query/use-connection-queries";

type ProfileConnectionStatsProps = {
  role: "candidate" | "recruiter";
  variant?: "block" | "inline";
};

export function ProfileConnectionStats({
  role,
  variant = "block",
}: ProfileConnectionStatsProps) {
  const { data: counts } = useConnectionCountsQuery(role);
  const href =
    role === "candidate" ? CANDIDATE_CONNECTIONS_PATH : RECRUITER_CONNECTIONS_PATH;

  if (variant === "inline") {
    if (!counts || counts.total === 0) {
      return (
        <Link
          href={href}
          className="flex min-w-0 items-center gap-1.5 text-blue-600 transition-colors hover:underline"
        >
          <Users className="h-4 w-4 shrink-0" />
          <span>Start building your network</span>
        </Link>
      );
    }

    return (
      <span className="flex min-w-0 items-center gap-1.5">
        <Users className="h-4 w-4 shrink-0" />
        <Link
          href={href}
          className="font-medium text-blue-600 transition-colors hover:underline"
        >
          {counts.connected} connected
        </Link>
      </span>
    );
  }

  if (!counts || counts.total === 0) {
    return (
      <Link
        href={href}
        className="mb-4 flex items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      >
        <Users className="h-4 w-4" />
        Start building your network — view connections
      </Link>
    );
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm">
      <Users className="h-4 w-4 text-blue-600" />
      <Link
        href={href}
        className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
      >
        {counts.connected} connected
      </Link>
      {counts.pendingReceived > 0 ? (
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
          {counts.pendingReceived} request{counts.pendingReceived === 1 ? "" : "s"} waiting
        </span>
      ) : null}
      {counts.pendingSent > 0 ? (
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          {counts.pendingSent} pending sent
        </span>
      ) : null}
    </div>
  );
}
