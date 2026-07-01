"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ConnectionSuggestionCard } from "@/components/connections/ConnectionSuggestionCard";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  CANDIDATE_FIND_CANDIDATES_PATH,
  CANDIDATE_FIND_RECRUITERS_PATH,
  RECRUITER_SEARCH_PATH,
} from "@/lib/auth/routes";
import type { ConnectionStatus } from "@/lib/connections/connection.types";
import {
  CONNECTION_SUGGESTION_FETCH_BUFFER,
  CONNECTION_SUGGESTION_TOTAL,
  CONNECTION_SUGGESTIONS_PER_TYPE,
  buildMixedSuggestions,
} from "@/lib/connections/connection-suggestion-utils";
import {
  showConnectionRequestErrorToast,
  showConnectionRequestSentToast,
} from "@/lib/connections/connection-toast";
import { getInitials } from "@/lib/profile/format";
import { sendCandidatePeerConnectionRequest } from "@/lib/query/candidate-peer-fetchers";
import {
  sendRecruiterConnectionRequest,
} from "@/lib/query/candidate-recruiter-fetchers";
import {
  sendRecruiterToCandidateConnection,
  sendRecruiterToRecruiterConnection,
} from "@/lib/query/connection-fetchers";
import { recruiterKeys } from "@/lib/query/keys";
import {
  fetchRecruiterPeerSuggestions,
  fetchRecruiterSearchResults,
} from "@/lib/query/recruiter-fetchers";
import { useRecruiterDirectoryQuery } from "@/lib/query/use-candidate-recruiter-queries";
import { useCandidatePeerSearchQuery } from "@/lib/query/use-candidate-peer-queries";

type ConnectionSuggestionsSectionProps = {
  role: "candidate" | "recruiter";
};

type SuggestionKind = "recruiter" | "candidate";

type ConnectionSuggestionItem = {
  key: string;
  kind: SuggestionKind;
  id: string;
  name: string;
  initials: string;
  subtitle: string;
  profilePictureUrl: string | null;
  connectionStatus: ConnectionStatus | null;
};

type SuggestionPoolEntry = {
  id: string;
  connectionStatus: ConnectionStatus | null;
  item: ConnectionSuggestionItem;
};

const EMPTY_PEER_SEARCH_PARAMS = {
  query: "",
  categoryId: "",
  availability: "All",
  workTypeCodes: [] as string[],
  country: "All",
  experience: "Any",
  references: "Any",
  page: 1,
  limit: CONNECTION_SUGGESTION_FETCH_BUFFER,
};

function getNameInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getConnectionActionState(
  connectionStatus: ConnectionStatus | null,
  isSending: boolean,
  isAwaitingOverride: boolean,
) {
  const isConnected = connectionStatus === "connected";
  const isAwaiting = connectionStatus === "pending" || isAwaitingOverride;

  return {
    isConnected,
    isAwaiting,
    actionLabel: isConnected
      ? "Connected"
      : isAwaiting
        ? "Pending"
        : isSending
          ? "Sending…"
          : "Request",
    actionDisabled: isConnected || isAwaiting || isSending,
  };
}

export function ConnectionSuggestionsSection({
  role,
}: ConnectionSuggestionsSectionProps) {
  const [connectingKey, setConnectingKey] = useState<string | null>(null);
  const [sentKeys, setSentKeys] = useState<Set<string>>(() => new Set());

  const recruiterDirectoryQuery = useRecruiterDirectoryQuery({
    query: "",
    specialisation: "All",
    page: 1,
    limit: CONNECTION_SUGGESTION_FETCH_BUFFER,
    enabled: role === "candidate",
  });

  const candidatePeerQuery = useCandidatePeerSearchQuery({
    ...EMPTY_PEER_SEARCH_PARAMS,
    enabled: role === "candidate",
  });

  const recruiterSearchQuery = useQuery({
    queryKey: recruiterKeys.search(EMPTY_PEER_SEARCH_PARAMS),
    queryFn: () => fetchRecruiterSearchResults(EMPTY_PEER_SEARCH_PARAMS),
    enabled: role === "recruiter",
    staleTime: 60_000,
  });

  const recruiterPeerQuery = useQuery({
    queryKey: recruiterKeys.peerSuggestions(CONNECTION_SUGGESTION_FETCH_BUFFER),
    queryFn: () =>
      fetchRecruiterPeerSuggestions(CONNECTION_SUGGESTION_FETCH_BUFFER),
    enabled: role === "recruiter",
    staleTime: 60_000,
  });

  const suggestions = useMemo((): ConnectionSuggestionItem[] => {
    if (role === "candidate") {
      const recruiters = recruiterDirectoryQuery.data?.recruiters ?? [];
      const candidates = candidatePeerQuery.data?.candidates ?? [];

      const mixed = buildMixedSuggestions<SuggestionPoolEntry>(
        recruiters.map((recruiter) => ({
          id: recruiter.id,
          connectionStatus: recruiter.connectionStatus,
          item: {
            key: `recruiter:${recruiter.id}`,
            kind: "recruiter" as const,
            id: recruiter.id,
            name: recruiter.name,
            initials: recruiter.avatar || getNameInitials(recruiter.name),
            subtitle: `${recruiter.title} · ${recruiter.company}`,
            profilePictureUrl: recruiter.profilePictureUrl,
            connectionStatus: recruiter.connectionStatus,
          },
        })),
        candidates.map((candidate) => ({
          id: candidate.id,
          connectionStatus: candidate.connectionStatus,
          item: {
            key: `candidate:${candidate.id}`,
            kind: "candidate" as const,
            id: candidate.id,
            name: `${candidate.firstName} ${candidate.lastName}`.trim(),
            initials: getInitials(candidate.firstName, candidate.lastName),
            subtitle:
              [candidate.title, candidate.category].filter(Boolean).join(" · ") ||
              "Candidate",
            profilePictureUrl: candidate.profilePictureUrl,
            connectionStatus: candidate.connectionStatus,
          },
        })),
        CONNECTION_SUGGESTIONS_PER_TYPE,
        CONNECTION_SUGGESTION_TOTAL,
        (entry) => entry.connectionStatus,
      );

      return mixed.map((entry) => entry.item);
    }

    const searchCandidates = recruiterSearchQuery.data?.candidates ?? [];
    const peerRecruiters = recruiterPeerQuery.data ?? [];

    const mixed = buildMixedSuggestions<SuggestionPoolEntry>(
      searchCandidates.map((candidate) => ({
        id: candidate.id,
        connectionStatus: null,
        item: {
          key: `candidate:${candidate.id}`,
          kind: "candidate" as const,
          id: candidate.id,
          name: `${candidate.firstName} ${candidate.lastName}`.trim(),
          initials: getInitials(candidate.firstName, candidate.lastName),
          subtitle:
            [candidate.title, candidate.category].filter(Boolean).join(" · ") ||
            "Candidate",
          profilePictureUrl: candidate.profilePictureUrl,
          connectionStatus: null,
        },
      })),
      peerRecruiters.map((recruiter) => ({
        id: recruiter.id,
        connectionStatus: recruiter.connectionStatus,
        item: {
          key: `recruiter:${recruiter.id}`,
          kind: "recruiter" as const,
          id: recruiter.id,
          name: recruiter.name,
          initials: recruiter.avatar || getNameInitials(recruiter.name),
          subtitle: `${recruiter.title} · ${recruiter.company}`,
          profilePictureUrl: recruiter.profilePictureUrl,
          connectionStatus: recruiter.connectionStatus,
        },
      })),
      CONNECTION_SUGGESTIONS_PER_TYPE,
      CONNECTION_SUGGESTION_TOTAL,
      (entry) => entry.connectionStatus,
    );

    return mixed.map((entry) => entry.item);
  }, [
    role,
    recruiterDirectoryQuery.data?.recruiters,
    candidatePeerQuery.data?.candidates,
    recruiterSearchQuery.data?.candidates,
    recruiterPeerQuery.data,
  ]);

  const loading =
    role === "candidate"
      ? (recruiterDirectoryQuery.isPending || candidatePeerQuery.isPending) &&
        suggestions.length === 0
      : (recruiterSearchQuery.isPending || recruiterPeerQuery.isPending) &&
        suggestions.length === 0;

  const seeAllHref =
    role === "candidate"
      ? CANDIDATE_FIND_RECRUITERS_PATH
      : RECRUITER_SEARCH_PATH;

  async function handleConnect(suggestion: ConnectionSuggestionItem) {
    setConnectingKey(suggestion.key);

    const firstName = suggestion.name.split(" ")[0] ?? suggestion.name;

    try {
      if (role === "candidate") {
        if (suggestion.kind === "recruiter") {
          await sendRecruiterConnectionRequest(
            suggestion.id,
            `Hi ${firstName}, I came across your profile on Vodora and I'm interested in connecting.`,
          );
          void recruiterDirectoryQuery.refetch();
        } else {
          await sendCandidatePeerConnectionRequest(
            suggestion.id,
            `Hi ${firstName}, I came across your profile on Vodora and I'd like to connect.`,
          );
          void candidatePeerQuery.refetch();
        }
      } else if (suggestion.kind === "candidate") {
        await sendRecruiterToCandidateConnection(
          suggestion.id,
          `Hi ${firstName}, I came across your profile on Vodora and I'd like to connect.`,
        );
        void recruiterSearchQuery.refetch();
      } else {
        await sendRecruiterToRecruiterConnection(
          suggestion.id,
          `Hi ${firstName}, I came across your profile on Vodora and I'd like to connect.`,
        );
        void recruiterPeerQuery.refetch();
      }

      showConnectionRequestSentToast(suggestion.name);
      setSentKeys((previous) => new Set(previous).add(suggestion.key));
    } catch {
      showConnectionRequestErrorToast();
    } finally {
      setConnectingKey(null);
    }
  }

  if (!loading && suggestions.length === 0) {
    return null;
  }

  return (
    <section
      className="mt-10 border-t border-gray-200 pt-10 sm:mt-12 sm:pt-12"
      aria-labelledby="suggestions-heading"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2
          id="suggestions-heading"
          className="text-lg font-semibold text-gray-900 sm:text-xl"
        >
          More suggestions for you
        </h2>
        <div className="flex items-center gap-3 text-sm font-medium">
          {role === "candidate" ? (
            <Link
              href={CANDIDATE_FIND_CANDIDATES_PATH}
              className="text-blue-600 transition-colors hover:text-blue-700"
            >
              Find candidates
            </Link>
          ) : null}
          <Link
            href={seeAllHref}
            className="text-blue-600 transition-colors hover:text-blue-700"
          >
            See all
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: CONNECTION_SUGGESTION_TOTAL }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <Skeleton className="h-16 w-full rounded-none" />
                <div className="px-4 pb-4 pt-10">
                  <Skeleton className="mx-auto mb-3 h-4 w-28" />
                  <Skeleton className="mx-auto h-3 w-36" />
                  <Skeleton className="mt-4 h-8 w-full rounded-full" />
                </div>
              </div>
            ))
          : suggestions.map((suggestion) => {
              const isSending = connectingKey === suggestion.key;
              const isAwaitingOverride = sentKeys.has(suggestion.key);
              const { actionLabel, actionDisabled } = getConnectionActionState(
                suggestion.connectionStatus,
                isSending,
                isAwaitingOverride,
              );

              return (
                <ConnectionSuggestionCard
                  key={suggestion.key}
                  name={suggestion.name}
                  initials={suggestion.initials}
                  subtitle={suggestion.subtitle}
                  profilePictureUrl={suggestion.profilePictureUrl}
                  actionLabel={actionLabel}
                  actionDisabled={actionDisabled}
                  onAction={() => {
                    if (actionDisabled) {
                      return;
                    }

                    void handleConnect(suggestion);
                  }}
                />
              );
            })}
      </div>
    </section>
  );
}
