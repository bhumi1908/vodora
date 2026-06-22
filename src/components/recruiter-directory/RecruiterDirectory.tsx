"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Building2,
  CheckCircle,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { RecruiterDirectorySkeleton } from "@/components/recruiter-directory/RecruiterDirectorySkeleton";
import { getTotalPages, Pagination } from "@/components/ui/Pagination";
import { getCandidateJobPath } from "@/lib/auth/routes";
import { showConnectionRequestErrorToast, showConnectionRequestSentToast } from "@/lib/connections/connection-toast";
import {
  RECRUITER_DIRECTORY_ALL_FILTER,
  RECRUITER_DIRECTORY_PAGE_SIZE,
} from "@/lib/recruiter/recruiter-directory-options";
import type { RecruiterDirectoryEntry } from "@/lib/recruiter/recruiter-directory.types";
import { connectionKeys } from "@/lib/query/connection-keys";
import {
  candidateRecruiterKeys,
  type RecruiterDirectoryQueryParams,
} from "@/lib/query/candidate-recruiter-keys";
import { sendRecruiterConnectionRequest } from "@/lib/query/candidate-recruiter-fetchers";
import { profileKeys } from "@/lib/query/keys";
import { fetchOwnCandidateProfile } from "@/lib/query/profile-fetchers";
import {
  useRecruiterDirectoryFiltersQuery,
  useRecruiterDirectoryQuery,
} from "@/lib/query/use-candidate-recruiter-queries";
import { transformOwnCandidateProfileToView } from "@/lib/profile/transform-own-candidate-profile";
import { useQuery } from "@tanstack/react-query";

function getFirstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

function ConnectModal({
  recruiter,
  onClose,
  onConnected,
}: {
  recruiter: RecruiterDirectoryEntry;
  onClose: () => void;
  onConnected: () => void;
}) {
  const { data: rawProfile } = useQuery({
    queryKey: profileKeys.own(),
    queryFn: fetchOwnCandidateProfile,
  });
  const ownProfile = rawProfile
    ? transformOwnCandidateProfileToView(rawProfile)
    : null;

  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [message, setMessage] = useState(
    `Hi ${getFirstName(recruiter.name)}, I came across your profile on Vodora and I'm interested in connecting. I'd love to explore opportunities you may be working on.`,
  );

  const mutation = useMutation({
    mutationFn: () => sendRecruiterConnectionRequest(recruiter.id, message),
    onSuccess: () => {
      setSubmitError(null);
      setSent(true);
      showConnectionRequestSentToast(recruiter.name);
    },
    onError: (error: Error) => {
      setSubmitError(error.message);
      showConnectionRequestErrorToast();
    },
  });

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl sm:p-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 sm:mb-5 sm:h-16 sm:w-16">
            <CheckCircle className="h-7 w-7 text-green-600 sm:h-8 sm:w-8" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 sm:text-2xl">
            Connection Request Sent!
          </h2>
          <p className="mb-1 text-sm text-gray-500 sm:text-base">
            Your request has been sent to{" "}
            <span className="font-medium text-gray-700">{recruiter.name}</span>.
          </p>
          <p className="mb-6 text-sm text-gray-400 sm:mb-8">
            They&apos;ll be able to view your verified profile and references
            before responding.
          </p>
          <button
            type="button"
            onClick={onConnected}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:text-base"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-h-none sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 p-5 pb-0 sm:p-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 sm:h-14 sm:w-14">
              <span className="text-lg font-bold text-blue-700 sm:text-xl">
                {recruiter.avatar}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                Connect with {getFirstName(recruiter.name)}
              </h2>
              <p className="text-xs text-gray-500 sm:text-sm">
                {recruiter.title} · {recruiter.company}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-gray-400 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5 sm:space-y-5 sm:p-8">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
              What {getFirstName(recruiter.name)} will see
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-blue-200">
                {ownProfile?.profilePictureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ownProfile.profilePictureUrl}
                    alt={ownProfile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-blue-800">
                    {ownProfile?.avatarInitials ?? "You"}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  {ownProfile?.name ?? "Your profile"}
                  {ownProfile?.title ? ` · ${ownProfile.title}` : ""}
                </p>
                <div className="mt-1 flex gap-2">
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    ✓ Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="connect-message"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Personal message
            </label>
            <textarea
              id="connect-message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {submitError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              <UserCheck className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {mutation.isPending ? "Sending..." : "Send Connection Request"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function isMissingRpcError(message: string): boolean {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("search_recruiters_for_candidates") ||
    normalized.includes("send_candidate_connection_request") ||
    normalized.includes("send_recruiter_peer_connection_request") ||
    normalized.includes("connections") ||
    normalized.includes("get_recruiter_directory_filters") ||
    normalized.includes("could not find the function") ||
    normalized.includes("schema cache")
  );
}

export function RecruiterDirectory() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedSpec, setSelectedSpec] = useState(RECRUITER_DIRECTORY_ALL_FILTER);
  const [page, setPage] = useState(1);
  const [connecting, setConnecting] = useState<RecruiterDirectoryEntry | null>(
    null,
  );

  const directoryQueryParams: RecruiterDirectoryQueryParams = {
    query: debouncedQuery,
    specialisation: selectedSpec,
    page,
    limit: RECRUITER_DIRECTORY_PAGE_SIZE,
  };

  const {
    data: specialisationFilters = [],
    isPending: isFiltersPending,
    error: filtersError,
  } = useRecruiterDirectoryFiltersQuery();

  const filterOptions = [
    RECRUITER_DIRECTORY_ALL_FILTER,
    ...specialisationFilters,
  ];

  useEffect(() => {
    if (
      selectedSpec !== RECRUITER_DIRECTORY_ALL_FILTER &&
      specialisationFilters.length > 0 &&
      !specialisationFilters.includes(selectedSpec)
    ) {
      setSelectedSpec(RECRUITER_DIRECTORY_ALL_FILTER);
    }
  }, [selectedSpec, specialisationFilters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  const { data, isPending, isFetching, error } = useRecruiterDirectoryQuery(
    directoryQueryParams,
  );

  const recruiters = data?.recruiters ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? getTotalPages(total, RECRUITER_DIRECTORY_PAGE_SIZE);
  const showInitialSkeleton = isPending && !data;

  function handleSpecialisationChange(specialisation: string) {
    setSelectedSpec(specialisation);
    setPage(1);
  }

  function handleConnect(recruiter: RecruiterDirectoryEntry) {
    setConnecting(recruiter);
  }

  function handleConnectClose() {
    setConnecting(null);
  }

  function handleConnectSuccess() {
    void queryClient.invalidateQueries({
      queryKey: candidateRecruiterKeys.all,
    });
    void queryClient.invalidateQueries({
      queryKey: connectionKeys.all,
    });
    setConnecting(null);
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="mb-1 text-2xl font-semibold text-gray-900 sm:text-3xl">
          Find a Recruiter
        </h1>
        <p className="text-sm text-gray-500 sm:text-base">
          Browse verified recruiters, see what roles they&apos;re hiring for, and
          connect directly.
        </p>
      </div>

      <div className="mb-5 sm:mb-6">
        <div className="relative">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-4 sm:h-5 sm:w-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, company, speciality, or role…"
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pr-10 pl-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:py-3 sm:pr-12 sm:pl-12"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 hover:text-gray-600 sm:right-4"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 sm:h-4 sm:w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:mb-8 sm:flex-wrap sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {isFiltersPending ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-9 w-24 animate-pulse rounded-full bg-gray-100"
            />
          ))
        ) : filtersError ? (
          <p className="text-sm text-amber-700">
            Could not load specialisation filters.
          </p>
        ) : (
          filterOptions.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => handleSpecialisationChange(spec)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
                selectedSpec === spec
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {spec}
            </button>
          ))
        )}
      </div>

      <p className="mb-5 text-sm text-gray-500">
        <span className="font-semibold text-gray-900">{total}</span> recruiters
        found
        {isFetching && !showInitialSkeleton ? (
          <span className="ml-2 text-gray-400">Updating…</span>
        ) : null}
      </p>

      {error ? (
        <div
          className={`rounded-xl border p-5 text-center sm:rounded-2xl sm:p-8 ${
            isMissingRpcError(error.message)
              ? "border-amber-200 bg-amber-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              isMissingRpcError(error.message)
                ? "text-amber-900"
                : "text-red-900"
            }`}
          >
            {isMissingRpcError(error.message)
              ? "Database setup required"
              : "Could not load recruiters"}
          </p>
          <p
            className={`mt-2 text-sm ${
              isMissingRpcError(error.message)
                ? "text-amber-800"
                : "text-red-700"
            }`}
          >
            {isMissingRpcError(error.message) ? (
              <>
                Apply the Supabase migration{" "}
                <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">
                  20250622200000_recruiter_directory_specialisation_filters.sql
                </code>{" "}
                in your Supabase project, then refresh this page.
              </>
            ) : (
              error.message
            )}
          </p>
        </div>
      ) : showInitialSkeleton ? (
        <RecruiterDirectorySkeleton />
      ) : (
        <>
          <div className="space-y-4 sm:space-y-5">
            {recruiters.map((recruiter) => (
              <div
                key={recruiter.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md sm:rounded-2xl"
              >
                <div className="flex items-start gap-3 p-4 sm:gap-5 sm:p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 sm:h-16 sm:w-16 sm:rounded-2xl">
                    {recruiter.profilePictureUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={recruiter.profilePictureUrl}
                        alt={recruiter.name}
                        className="h-full w-full rounded-xl object-cover sm:rounded-2xl"
                      />
                    ) : (
                      <span className="text-base font-bold text-blue-700 sm:text-xl">
                        {recruiter.avatar}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <div className="mb-0.5 flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                            {recruiter.name}
                          </h3>
                          {recruiter.verified ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] text-green-700 sm:text-xs">
                              <CheckCircle className="h-3 w-3 shrink-0" />
                              <span className="hidden sm:inline">Verified Recruiter</span>
                              <span className="sm:hidden">Verified</span>
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-gray-600">{recruiter.title}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500 sm:gap-x-4 sm:gap-y-2">
                          <span className="inline-flex min-w-0 items-center gap-1">
                            <Building2 className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{recruiter.company}</span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {recruiter.location}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 shrink-0" />
                            {recruiter.placements} placements
                          </span>
                          <span className="font-medium text-green-600">
                            Avg. hire: {recruiter.avgHire}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 self-stretch sm:self-auto">
                        {recruiter.connectionStatus === "connected" ? (
                          <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 sm:w-auto sm:px-5 sm:py-2.5">
                            <CheckCircle className="h-4 w-4 shrink-0" /> Connected
                          </span>
                        ) : recruiter.connectionStatus === "pending" ? (
                          <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 sm:w-auto sm:px-5 sm:py-2.5">
                            <Clock3 className="h-4 w-4 shrink-0" /> Pending
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleConnect(recruiter)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto sm:px-5 sm:py-2.5"
                          >
                            <UserCheck className="h-4 w-4 shrink-0" />
                            Connect
                          </button>
                        )}
                      </div>
                    </div>

                    {recruiter.specialisations.length > 0 ||
                    recruiter.industries.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {recruiter.specialisations.map((specialisation) => (
                          <span
                            key={specialisation}
                            className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                          >
                            {specialisation}
                          </span>
                        ))}
                        {recruiter.industries.map((industry) => (
                          <span
                            key={industry}
                            className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                          >
                            {industry}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                {recruiter.activeRoles.length > 0 ? (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Briefcase className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase sm:text-xs">
                        Currently Hiring · {recruiter.activeRoles.length} open
                        role
                        {recruiter.activeRoles.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                      {recruiter.activeRoles.map((role) => (
                        <Link
                          key={role.id}
                          href={getCandidateJobPath(role.id)}
                          className="group flex w-full min-w-0 cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 transition-all hover:border-blue-300 hover:shadow-sm sm:w-auto sm:max-w-full sm:px-4"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {role.title}
                            </p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                              <span className="font-medium text-blue-600">
                                {role.type}
                              </span>
                              <span className="hidden sm:inline">·</span>
                              <span>{role.location}</span>
                              <span className="hidden sm:inline">·</span>
                              <span className="font-medium text-gray-700">
                                {role.salary}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-blue-500" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {!showInitialSkeleton && recruiters.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white py-12 text-center sm:rounded-2xl sm:py-20">
              <Users className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="font-medium text-gray-500">
                No recruiters match your search
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  handleSpecialisationChange(RECRUITER_DIRECTORY_ALL_FILTER);
                }}
                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear search
              </button>
            </div>
          ) : null}

          {totalPages > 1 ? (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className="mt-8"
            />
          ) : null}
        </>
      )}

      {connecting ? (
        <ConnectModal
          recruiter={connecting}
          onClose={handleConnectClose}
          onConnected={handleConnectSuccess}
        />
      ) : null}
    </div>
  );
}
