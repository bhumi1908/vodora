"use client";

import {
  ArrowRight,
  Clock3,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ConnectionListCard } from "@/components/connections/ConnectionListCard";
import { ConnectionListSkeleton } from "@/components/connections/ConnectionListSkeleton";
import { ConnectionsPageHeader } from "@/components/connections/ConnectionsPageHeader";
import { ConnectionsSidebar } from "@/components/connections/ConnectionsSidebar";
import { ConnectionSuggestionsSection } from "@/components/connections/ConnectionSuggestionsSection";
import { InviteModal } from "@/components/landing/InviteModal";
import { Pagination, getTotalPages } from "@/components/ui/Pagination";
import {
  CANDIDATE_FIND_CANDIDATES_PATH,
  CANDIDATE_FIND_RECRUITERS_PATH,
  RECRUITER_SEARCH_PATH,
} from "@/lib/auth/routes";
import type { ConnectionTab } from "@/lib/connections/connection.types";
import {
  showConnectionAcceptedToast,
  showConnectionRespondErrorToast,
} from "@/lib/connections/connection-toast";
import { CONNECTION_PAGE_SIZE } from "@/lib/query/connection-keys";
import {
  useCandidateConnectionsQuery,
  useConnectionCountsQuery,
  useRecruiterConnectionsQuery,
  useRespondToConnectionMutation,
} from "@/lib/query/use-connection-queries";

const TAB_DESCRIPTIONS: Record<ConnectionTab, string> = {
  received: "People who want to connect with you",
  sent: "Requests you have sent",
  connected: "Your active connections",
};

type ConnectionsPageProps = {
  role: "candidate" | "recruiter";
};

export function ConnectionsPage({ role }: ConnectionsPageProps) {
  const [tab, setTab] = useState<ConnectionTab>("received");
  const [page, setPage] = useState(1);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { data: counts } = useConnectionCountsQuery(role);
  const candidateQuery = useCandidateConnectionsQuery(tab, page, role === "candidate");
  const recruiterQuery = useRecruiterConnectionsQuery(tab, page, role === "recruiter");
  const respondMutation = useRespondToConnectionMutation(role);

  const activeQuery = role === "candidate" ? candidateQuery : recruiterQuery;
  const { data: connectionData, isPending, isFetching, error } = activeQuery;

  const candidateConnections = candidateQuery.data?.connections ?? [];
  const recruiterConnections = recruiterQuery.data?.connections ?? [];
  const connections =
    role === "candidate" ? candidateConnections : recruiterConnections;
  const totalCount = connectionData?.totalCount ?? 0;
  const listLimit = connectionData?.limit ?? CONNECTION_PAGE_SIZE;
  const totalPages =
    connectionData?.totalPages ?? getTotalPages(totalCount, listLimit);
  const loading = isPending && connections.length === 0;

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleTabChange(nextTab: ConnectionTab) {
    setTab(nextTab);
    setPage(1);
  }

  async function handleRespond(
    connectionId: string,
    action: "accept" | "reject",
    personName?: string,
  ) {
    setRespondingId(connectionId);

    try {
      await respondMutation.mutateAsync({ connectionId, action });
      if (action === "accept") {
        showConnectionAcceptedToast(personName);
      }

      const nextTotalCount = Math.max(0, totalCount - 1);
      const nextTotalPages = getTotalPages(nextTotalCount, listLimit);
      if (page > nextTotalPages && nextTotalPages > 0) {
        setPage(nextTotalPages);
      }
    } catch {
      showConnectionRespondErrorToast();
    } finally {
      setRespondingId(null);
    }
  }

  function getTabResultLabel(): string {
    if (tab === "received") {
      return totalCount === 1 ? "request" : "requests";
    }

    if (tab === "sent") {
      return totalCount === 1 ? "pending request" : "pending requests";
    }

    return totalCount === 1 ? "connection" : "connections";
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <ConnectionsPageHeader
        role={role}
        onInviteClick={() => setShowInviteModal(true)}
      />

      <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-start lg:gap-8">
        <ConnectionsSidebar
          tab={tab}
          counts={counts}
          onTabChange={handleTabChange}
        />

        <div className="min-w-0 flex-1" role="tabpanel">
          <p className="mb-5 text-sm text-gray-500">
            {TAB_DESCRIPTIONS[tab]}
            {isFetching && !loading ? (
              <span className="ml-2 text-gray-400">Updating…</span>
            ) : null}
          </p>

          {!loading && !error && totalCount > 0 ? (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{totalCount}</span>{" "}
                {getTabResultLabel()}
                {totalPages > 1 ? (
                  <span className="text-gray-500">
                    {" "}
                    · page {page} of {totalPages}
                  </span>
                ) : null}
              </p>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-sm font-medium text-red-900">
                Could not load connections
              </p>
              <p className="mt-2 text-sm text-red-700">
                {error instanceof Error ? error.message : "Something went wrong."}
              </p>
            </div>
          ) : loading ? (
            <ConnectionListSkeleton />
          ) : connections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center sm:py-20">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
                <Users className="h-7 w-7 text-gray-300" />
              </div>
              <p className="font-medium text-gray-700">
                {tab === "received"
                  ? "No connection requests yet"
                  : tab === "sent"
                    ? "No pending requests"
                    : "No connections yet"}
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                {tab === "connected"
                  ? role === "candidate"
                    ? "Connect with recruiters or other candidates to grow your network."
                    : "Connect with candidates or other recruiters to grow your network."
                  : "New activity will appear here when someone reaches out."}
              </p>
              {tab === "connected" ? (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  {role === "candidate" ? (
                    <>
                      <Link
                        href={CANDIDATE_FIND_RECRUITERS_PATH}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                      >
                        <UserPlus className="h-4 w-4" />
                        Find Recruiters
                      </Link>
                      <Link
                        href={CANDIDATE_FIND_CANDIDATES_PATH}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        Find Candidates
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={RECRUITER_SEARCH_PATH}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4" />
                      Search Candidates
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              ) : tab === "received" && counts && counts.pendingSent > 0 ? (
                <button
                  type="button"
                  onClick={() => handleTabChange("sent")}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  <Clock3 className="h-4 w-4" />
                  View your {counts.pendingSent} pending sent request
                  {counts.pendingSent === 1 ? "" : "s"}
                </button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              {role === "candidate"
                ? candidateConnections.map((connection) => (
                    <ConnectionListCard
                      key={connection.id}
                      role="candidate"
                      tab={tab}
                      connection={connection}
                      onAccept={(id) =>
                        void handleRespond(id, "accept", connection.name)
                      }
                      onReject={(id) =>
                        void handleRespond(id, "reject", connection.name)
                      }
                      isResponding={respondingId === connection.id}
                    />
                  ))
                : recruiterConnections.map((connection) => (
                    <ConnectionListCard
                      key={connection.id}
                      role="recruiter"
                      tab={tab}
                      connection={connection}
                      onAccept={(id) =>
                        void handleRespond(id, "accept", connection.name)
                      }
                      onReject={(id) =>
                        void handleRespond(id, "reject", connection.name)
                      }
                      isResponding={respondingId === connection.id}
                    />
                  ))}
            </div>
          )}

          {!loading && !isFetching && totalPages > 1 ? (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mt-8"
            />
          ) : null}
        </div>
      </div>

      <ConnectionSuggestionsSection role={role} />

      {showInviteModal ? (
        <InviteModal onClose={() => setShowInviteModal(false)} />
      ) : null}
    </main>
  );
}
