"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Inbox,
  Send,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ConnectionListCard } from "@/components/connections/ConnectionListCard";
import { ConnectionListSkeleton } from "@/components/connections/ConnectionListSkeleton";
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

const TABS: {
  id: ConnectionTab;
  label: string;
  description: string;
  icon: typeof Inbox;
}[] = [
    {
      id: "received",
      label: "Requests",
      description: "People who want to connect with you",
      icon: Inbox,
    },
    {
      id: "sent",
      label: "Pending",
      description: "Requests you have sent",
      icon: Send,
    },
    {
      id: "connected",
      label: "Connected",
      description: "Your active connections",
      icon: CheckCircle2,
    },
  ];

type ConnectionsPageProps = {
  role: "candidate" | "recruiter";
};

export function ConnectionsPage({ role }: ConnectionsPageProps) {
  const [tab, setTab] = useState<ConnectionTab>("received");
  const [page, setPage] = useState(1);
  const [respondingId, setRespondingId] = useState<string | null>(null);

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

  function getTabCount(tabId: ConnectionTab): number {
    if (!counts) {
      return 0;
    }

    if (tabId === "received") {
      return counts.pendingReceived;
    }

    if (tabId === "sent") {
      return counts.pendingSent;
    }

    return counts.connected;
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

  const activeTab = TABS.find((item) => item.id === tab);

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="mb-4 flex items-start gap-3 sm:gap-4">

          <div>
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
              Connections
            </h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Manage incoming requests, track pending invites, and view your
              network.
            </p>
          </div>
        </div>

        {counts ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-green-800">
                  {counts.connected}
                </p>
                <p className="text-sm text-green-700">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <Inbox className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-amber-800">
                  {counts.pendingReceived}
                </p>
                <p className="text-sm text-amber-700">Requests waiting</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-blue-800">
                  {counts.pendingSent}
                </p>
                <p className="text-sm text-blue-700">Pending sent</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50/80 p-1.5">
        <div className="-mx-0.5 flex gap-1.5 overflow-x-auto px-0.5 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden">
          {TABS.map((item) => {
            const count = getTabCount(item.id);
            const active = tab === item.id;
            const TabIcon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all sm:flex-1 sm:justify-center sm:px-4 ${active
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                  }`}
              >
                <TabIcon className="h-4 w-4 shrink-0" />
                {item.label}
                {count > 0 ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${active
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-200/80 text-gray-600"
                      }`}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mb-5 text-sm text-gray-500">
        {activeTab?.description}
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
                onAccept={(id) => void handleRespond(id, "accept", connection.name)}
                onReject={(id) => void handleRespond(id, "reject", connection.name)}
                isResponding={respondingId === connection.id}
              />
            ))
            : recruiterConnections.map((connection) => (
              <ConnectionListCard
                key={connection.id}
                role="recruiter"
                tab={tab}
                connection={connection}
                onAccept={(id) => void handleRespond(id, "accept", connection.name)}
                onReject={(id) => void handleRespond(id, "reject", connection.name)}
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
  );
}
