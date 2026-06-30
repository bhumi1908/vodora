"use client";

import { BellOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { NotificationDropdownSkeleton } from "@/components/notifications/NotificationDropdownSkeleton";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Pagination } from "@/components/ui/Pagination";
import { NOTIFICATION_PAGE_SIZE } from "@/lib/notifications/notification-options";
import type {
  NotificationItem as NotificationItemType,
  NotificationReadFilter,
} from "@/lib/notifications/notification.types";
import { parseNotificationReadFilter } from "@/lib/notifications/parse-notification-filter";
import {
  useDeleteAllNotificationsMutation,
  useDeleteNotificationMutation,
  useMarkNotificationReadMutation,
  useNotificationCountsQuery,
  useNotificationsQuery,
} from "@/lib/query/use-notification-queries";

const FILTERS: { id: NotificationReadFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
];

export function NotificationsPageClient() {
  return (
    <Suspense fallback={<NotificationsPageSkeleton />}>
      <NotificationsPageContent />
    </Suspense>
  );
}

function NotificationsPageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-8 h-20 animate-pulse rounded-xl bg-gray-100" />
      <NotificationDropdownSkeleton />
    </div>
  );
}

function NotificationsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<NotificationReadFilter>(() =>
    parseNotificationReadFilter(searchParams.get("filter")),
  );
  const [page, setPage] = useState(() => {
    const rawPage = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  });

  const { data: counts } = useNotificationCountsQuery();
  const { data, isPending, isError, isFetching } = useNotificationsQuery(
    page,
    NOTIFICATION_PAGE_SIZE,
    filter,
  );
  const markReadMutation = useMarkNotificationReadMutation();
  const deleteMutation = useDeleteNotificationMutation();
  const clearAllMutation = useDeleteAllNotificationsMutation();

  const notifications = data?.notifications ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalCount = data?.totalCount ?? 0;
  const isListLoading = isPending && notifications.length === 0;

  useEffect(() => {
    const params = new URLSearchParams();

    if (filter !== "all") {
      params.set("filter", filter);
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const next = params.toString();
    const nextUrl = next ? `/notifications?${next}` : "/notifications";
    router.replace(nextUrl, { scroll: false });
  }, [filter, page, router]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function handleFilterChange(nextFilter: NotificationReadFilter) {
    setFilter(nextFilter);
    setPage(1);
  }

  function handleOpenNotification(notification: NotificationItemType) {
    if (!notification.readAt) {
      markReadMutation.mutate({ notificationId: notification.id, read: true });
    }

    router.push(notification.actionUrl);
  }

  function handleDelete(notificationId: string) {
    deleteMutation.mutate(notificationId);
  }

  function handleClearAll() {
    if (
      !window.confirm(
        "Clear all notifications? This permanently removes them from your inbox.",
      )
    ) {
      return;
    }

    clearAllMutation.mutate(undefined, {
      onSuccess: () => {
        setPage(1);
      },
    });
  }

  const showClearAll = totalCount > 0 && !clearAllMutation.isPending;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Notifications</h1>
          <p className="mt-2 text-gray-600">
            {counts
              ? counts.total > 0
                ? `${counts.unread} unread · ${counts.total} total`
                : "Your notification history will appear here."
              : "Your notification history will appear here."}
          </p>
        </div>
        {showClearAll ? (
          <button
            type="button"
            className="shrink-0 cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={clearAllMutation.isPending}
            onClick={handleClearAll}
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((option) => {
          const isActive = filter === option.id;

          return (
            <button
              key={option.id}
              type="button"
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => handleFilterChange(option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isListLoading ? (
          <NotificationDropdownSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <BellOff className="h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-600">Could not load notifications.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <BellOff className="h-10 w-10 text-gray-300" />
            <p className="text-sm font-medium text-gray-900">
              {filter === "unread"
                ? "No unread notifications"
                : filter === "read"
                  ? "No read notifications"
                  : "No notifications yet"}
            </p>
            <p className="text-xs text-gray-500">
              Connection requests, applications, and references will appear here.
            </p>
          </div>
        ) : (
          <div className="py-1">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onOpen={handleOpenNotification}
                onDelete={handleDelete}
                deleting={
                  deleteMutation.isPending &&
                  deleteMutation.variables === notification.id
                }
              />
            ))}
            {isFetching && !isPending ? (
              <p className="border-t border-gray-100 px-4 py-2 text-center text-xs text-gray-400">
                Updating...
              </p>
            ) : null}
          </div>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </div>
  );
}
