"use client";

import {
  Building2,
  CheckCircle,
  Clock3,
  MapPin,
  UserCheck,
  X,
} from "lucide-react";
import Link from "next/link";

import type {
  CandidateConnectionEntry,
  ConnectionTab,
  RecruiterConnectionEntry,
} from "@/lib/connections/connection.types";
import {
  CANDIDATE_FIND_RECRUITERS_PATH,
  getCandidatePeerProfilePath,
  getRecruiterCandidateProfilePath,
  RECRUITER_SEARCH_PATH,
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

export function ConnectionListCard(props: ConnectionListCardProps) {
  const { tab, onAccept, onReject, isResponding = false } = props;
  const connection = props.connection;
  const canRespond = tab === "received" && connection.status === "pending";

  const profileHref =
    props.role === "recruiter" && props.connection.vodoraId
      ? getRecruiterCandidateProfilePath(props.connection.vodoraId)
      : props.role === "candidate" &&
          props.connection.connectionType === "candidate_candidate" &&
          props.connection.vodoraId
        ? getCandidatePeerProfilePath(props.connection.vodoraId)
        : props.role === "candidate"
          ? CANDIDATE_FIND_RECRUITERS_PATH
          : RECRUITER_SEARCH_PATH;

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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200">
            {connection.profilePictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={connection.profilePictureUrl}
                alt={connection.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-blue-700">
                {getInitials(connection.name)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">
                {connection.name}
              </h3>
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
              <p className="text-sm text-gray-600">{subtitle}</p>
            ) : null}

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {connection.location}
              </span>
              {props.role === "candidate" &&
              props.connection.connectionType === "candidate_recruiter" ? (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {connection.company}
                </span>
              ) : null}
              {timestamp ? <span>{timestamp}</span> : null}
            </div>

            {connection.message ? (
              <p className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                {connection.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          {canRespond ? (
            <>
              <button
                type="button"
                disabled={isResponding}
                onClick={() => onAccept?.(connection.id)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                <UserCheck className="h-4 w-4" />
                Accept
              </button>
              <button
                type="button"
                disabled={isResponding}
                onClick={() => onReject?.(connection.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Decline
              </button>
            </>
          ) : tab === "connected" &&
            props.connection.vodoraId &&
            (props.role === "recruiter" ||
              (props.role === "candidate" &&
                props.connection.connectionType === "candidate_candidate")) ? (
            <Link
              href={profileHref}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
            >
              View Profile
            </Link>
          ) : tab === "sent" ? (
            <span className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
              Awaiting response
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
