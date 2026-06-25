"use client";

import {
  Building2,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock3,
  MapPin,
  MessageSquare,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";

import type {
  CandidateConnectionEntry,
  ConnectionTab,
  ConnectionType,
  RecruiterConnectionEntry,
} from "@/lib/connections/connection.types";
import {
  getCandidatePeerProfilePath,
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

function formatDate(value: string | null): string {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getConnectionTypeLabel(
  role: "candidate" | "recruiter",
  connectionType: ConnectionType,
): string {
  if (connectionType === "candidate_recruiter") {
    return role === "candidate" ? "Recruiter" : "Candidate";
  }

  if (connectionType === "candidate_candidate") {
    return "Candidate";
  }

  return "Recruiter";
}

function getViewProfileHref(
  role: "candidate" | "recruiter",
  connection: CandidateConnectionEntry | RecruiterConnectionEntry,
): string | null {
  if (!connection.vodoraId) {
    return null;
  }

  if (role === "recruiter") {
    return getRecruiterCandidateProfilePath(connection.vodoraId);
  }

  if (
    role === "candidate" &&
    connection.connectionType === "candidate_candidate"
  ) {
    return getCandidatePeerProfilePath(connection.vodoraId);
  }

  return null;
}

export function ConnectionListCard(props: ConnectionListCardProps) {
  const { tab, onAccept, onReject, isResponding = false } = props;
  const connection = props.connection;
  const canRespond = tab === "received" && connection.status === "pending";
  const typeLabel = getConnectionTypeLabel(props.role, connection.connectionType);
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
      ? formatDate(connection.connectedAt ?? connection.requestedAt)
      : formatDate(connection.requestedAt);

  const timestampLabel =
    tab === "connected" ? "Connected" : tab === "sent" ? "Sent" : "Requested";

  const initials = getInitials(connection.name);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 sm:h-16 sm:w-16">
            {connection.profilePictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={connection.profilePictureUrl}
                alt={connection.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-blue-700 sm:text-xl">
                {initials}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-gray-900">{connection.name}</h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
                <Users className="h-3 w-3" />
                {typeLabel}
              </span>
              {connection.status === "connected" ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  <Clock3 className="h-3 w-3" />
                  Pending
                </span>
              )}
            </div>

            {subtitle ? (
              <p className="mt-0.5 text-sm text-gray-600">{subtitle}</p>
            ) : null}

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
              {connection.location ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {connection.location}
                </span>
              ) : null}
              {props.role === "candidate" &&
              props.connection.connectionType === "candidate_recruiter" &&
              connection.company ? (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-blue-500" />
                  {connection.company}
                </span>
              ) : null}
              {timestamp ? (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  {timestampLabel} {timestamp}
                </span>
              ) : null}
            </div>

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

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          {canRespond ? (
            <>
              <button
                type="button"
                disabled={isResponding}
                onClick={() => onAccept?.(connection.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                <UserCheck className="h-4 w-4" />
                Accept
              </button>
              <button
                type="button"
                disabled={isResponding}
                onClick={() => onReject?.(connection.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Decline
              </button>
            </>
          ) : viewProfileHref ? (
            <Link
              href={viewProfileHref}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              View Profile
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : tab === "sent" ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
              <Clock3 className="h-4 w-4" />
              Awaiting response
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
