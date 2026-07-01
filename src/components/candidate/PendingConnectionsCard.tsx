"use client";

import { ArrowRight, UserCheck, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Skeleton } from "@/components/ui/Skeleton";
import { CANDIDATE_CONNECTIONS_PATH } from "@/lib/auth/routes";
import type {
  CandidateConnectionEntry,
  ConnectionCounts,
} from "@/lib/connections/connection.types";
import {
  showConnectionAcceptedToast,
  showConnectionRespondErrorToast,
} from "@/lib/connections/connection-toast";
import {
  useCandidateConnectionsQuery,
  useConnectionCountsQuery,
  useRespondToConnectionMutation,
} from "@/lib/query/use-connection-queries";

const DASHBOARD_PREVIEW_LIMIT = 3;

type PendingConnectionsCardProps = {
  initialCounts: ConnectionCounts;
};

function getNameInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getConnectionSubtitle(connection: CandidateConnectionEntry): string {
  if (connection.connectionType === "candidate_recruiter") {
    return `${connection.title} · ${connection.company}`;
  }

  return [connection.title, connection.company].filter(Boolean).join(" · ");
}

function getConnectionTypeLabel(connection: CandidateConnectionEntry): string {
  return connection.connectionType === "candidate_recruiter"
    ? "Recruiter"
    : "Candidate";
}

type ConnectionRequestRowProps = {
  connection: CandidateConnectionEntry;
  isResponding: boolean;
  onAccept: () => void;
  onReject: () => void;
};

function ConnectionRequestRow({
  connection,
  isResponding,
  onAccept,
  onReject,
}: ConnectionRequestRowProps) {
  const subtitle = getConnectionSubtitle(connection);
  const typeLabel = getConnectionTypeLabel(connection);
  const initials = getNameInitials(connection.name);

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
          {connection.profilePictureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={connection.profilePictureUrl}
              alt={connection.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-blue-700">{initials}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate font-medium text-gray-900">{connection.name}</p>
            <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600">
              {typeLabel}
            </span>
          </div>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs text-gray-600">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={isResponding}
          onClick={onAccept}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          <UserCheck className="h-3.5 w-3.5" />
          Accept
        </button>
        <button
          type="button"
          disabled={isResponding}
          onClick={onReject}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
        >
          <X className="h-3.5 w-3.5" />
          Decline
        </button>
      </div>
    </div>
  );
}

function PendingConnectionsCardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-gray-100 bg-gray-50/80 p-3"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Skeleton className="h-8 flex-1 rounded-lg" />
            <Skeleton className="h-8 flex-1 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PendingConnectionsCard({
  initialCounts,
}: PendingConnectionsCardProps) {
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const { data: liveCounts } = useConnectionCountsQuery("candidate");
  const counts = liveCounts ?? initialCounts;

  const hasPendingReceived = counts.pendingReceived > 0;
  const hasPendingSent = counts.pendingSent > 0;

  const { data: connectionData, isPending: isLoadingConnections } =
    useCandidateConnectionsQuery(
      "received",
      1,
      hasPendingReceived,
      DASHBOARD_PREVIEW_LIMIT,
    );

  const respondMutation = useRespondToConnectionMutation("candidate");

  if (!hasPendingReceived && !hasPendingSent) {
    return null;
  }

  const connections = connectionData?.connections ?? [];
  const totalReceived = connectionData?.totalCount ?? counts.pendingReceived;
  const remainingCount = Math.max(0, totalReceived - connections.length);

  async function handleRespond(
    connectionId: string,
    action: "accept" | "reject",
    personName: string,
  ) {
    setRespondingId(connectionId);

    try {
      await respondMutation.mutateAsync({ connectionId, action });
      if (action === "accept") {
        showConnectionAcceptedToast(personName);
      }
    } catch {
      showConnectionRespondErrorToast();
    } finally {
      setRespondingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Connection Requests</h2>
        <Link
          href={CANDIDATE_CONNECTIONS_PATH}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {hasPendingReceived ? (
        <div className="space-y-3">
          {isLoadingConnections && connections.length === 0 ? (
            <PendingConnectionsCardSkeleton />
          ) : connections.length > 0 ? (
            connections.map((connection) => (
              <ConnectionRequestRow
                key={connection.id}
                connection={connection}
                isResponding={respondingId === connection.id}
                onAccept={() =>
                  void handleRespond(connection.id, "accept", connection.name)
                }
                onReject={() =>
                  void handleRespond(connection.id, "reject", connection.name)
                }
              />
            ))
          ) : (
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              {counts.pendingReceived} waiting for you
            </span>
          )}

          {remainingCount > 0 ? (
            <Link
              href={CANDIDATE_CONNECTIONS_PATH}
              className="block text-center text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              + {remainingCount} more waiting for you
            </Link>
          ) : null}
        </div>
      ) : null}

      {hasPendingSent ? (
        <div className={hasPendingReceived ? "mt-3" : undefined}>
          <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            {counts.pendingSent} pending sent
          </span>
        </div>
      ) : null}
    </div>
  );
}
