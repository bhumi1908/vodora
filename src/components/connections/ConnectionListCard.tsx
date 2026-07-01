"use client";

import { Clock3, MessageSquare } from "lucide-react";
import Link from "next/link";

import { ConnectionAvatar } from "@/components/connections/ConnectionAvatar";
import type {
  CandidateConnectionEntry,
  ConnectionTab,
  RecruiterConnectionEntry,
} from "@/lib/connections/connection.types";
import {
  formatConnectionDate,
  formatConnectionRelativeTime,
} from "@/lib/connections/format-connection-time";
import {
  getCandidatePeerProfilePath,
  getCandidateRecruiterProfilePath,
  getRecruiterCandidateProfilePath,
} from "@/lib/auth/routes";

type ConnectionListCardProps =
  | {
      role: "candidate";
      tab: ConnectionTab;
      connection: CandidateConnectionEntry;
      onAccept?: (connectionId: string) => void;
      onReject?: (connectionId: string) => void;
      isResponding?: boolean;
    }
  | {
      role: "recruiter";
      tab: ConnectionTab;
      connection: RecruiterConnectionEntry;
      onAccept?: (connectionId: string) => void;
      onReject?: (connectionId: string) => void;
      isResponding?: boolean;
    };

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getViewProfileHref(
  role: "candidate" | "recruiter",
  connection: CandidateConnectionEntry | RecruiterConnectionEntry,
): string | null {
  if (role === "recruiter") {
    if (!connection.vodoraId) {
      return null;
    }

    return getRecruiterCandidateProfilePath(connection.vodoraId);
  }

  const candidateConnection = connection as CandidateConnectionEntry;

  if (
    candidateConnection.connectionType === "candidate_candidate" &&
    candidateConnection.vodoraId
  ) {
    return getCandidatePeerProfilePath(candidateConnection.vodoraId);
  }

  if (
    candidateConnection.connectionType === "candidate_recruiter" &&
    candidateConnection.recruiterId
  ) {
    return getCandidateRecruiterProfilePath(candidateConnection.recruiterId);
  }

  return null;
}

export function ConnectionListCard(props: ConnectionListCardProps) {
  const { tab, onAccept, onReject, isResponding = false } = props;
  const connection = props.connection;
  const canRespond = tab === "received" && connection.status === "pending";
  const viewProfileHref =
    tab === "connected" ? getViewProfileHref(props.role, connection) : null;

  const subtitle =
    props.role === "candidate"
      ? props.connection.connectionType === "candidate_recruiter"
        ? `${connection.title} · ${connection.company}`
        : [connection.title, connection.company].filter(Boolean).join(" · ")
      : props.connection.connectionType === "recruiter_recruiter"
        ? `${connection.title} · ${connection.company ?? "Recruiter"}`
        : [connection.title, connection.company].filter(Boolean).join(" · ");

  const timestamp =
    tab === "connected"
      ? formatConnectionDate(connection.connectedAt ?? connection.requestedAt)
      : formatConnectionRelativeTime(connection.requestedAt);

  const timestampLabel =
    tab === "connected" ? "Connected" : tab === "sent" ? "Sent" : "Requested";

  const initials = getInitials(connection.name);

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <ConnectionAvatar
            name={connection.name}
            initials={initials}
            profilePictureUrl={connection.profilePictureUrl}
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-gray-900">{connection.name}</h3>
              {tab === "connected" ? (
                <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                  Connected
                </span>
              ) : null}
            </div>

            {subtitle ? (
              <p className="mt-0.5 text-sm text-gray-600">{subtitle}</p>
            ) : null}

            {timestamp ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
                <Clock3 className="h-3.5 w-3.5 shrink-0" />
                {tab === "connected"
                  ? `${timestampLabel} ${timestamp}`
                  : `${timestampLabel} ${timestamp}`}
              </p>
            ) : null}

            {connection.message ? (
              <div className="mt-3 flex gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                <p className="text-sm leading-relaxed text-gray-600">
                  {connection.message}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-2 md:ml-4">
          {canRespond ? (
            <>
              <button
                type="button"
                disabled={isResponding}
                onClick={() => onReject?.(connection.id)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 md:flex-none"
              >
                Decline
              </button>
              <button
                type="button"
                disabled={isResponding}
                onClick={() => onAccept?.(connection.id)}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60 md:flex-none"
              >
                Accept
              </button>
            </>
          ) : viewProfileHref ? (
            <Link
              href={viewProfileHref}
              className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              View profile
            </Link>
          ) : tab === "sent" ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
              <Clock3 className="h-4 w-4" />
              Awaiting response
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
