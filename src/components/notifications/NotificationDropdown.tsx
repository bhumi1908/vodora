"use client";

import { ArrowRight, BellOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  NotificationDropdownHeaderSkeleton,
  NotificationDropdownSkeleton,
} from "@/components/notifications/NotificationDropdownSkeleton";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { NOTIFICATIONS_PATH } from "@/lib/auth/routes";
import {
  NOTIFICATION_OPEN_MS,
  prefersReducedMotion,
} from "@/lib/notifications/notification-animation";
import { NOTIFICATION_PAGE_SIZE } from "@/lib/notifications/notification-options";
import type { NotificationItem as NotificationItemType } from "@/lib/notifications/notification.types";
import {
  useMarkAllNotificationsReadMutation,
  useNotificationCountsQuery,
  useNotificationsQuery,
} from "@/lib/query/use-notification-queries";

type NotificationDropdownProps = {
  visible: boolean;
  onOpenNotification: (notification: NotificationItemType) => void;
};

export function NotificationDropdown({
  visible,
  onOpenNotification,
}: NotificationDropdownProps) {
  const { data: counts } = useNotificationCountsQuery();
  const { data, isPending, isError, isFetching, isLoading } =
    useNotificationsQuery(1, NOTIFICATION_PAGE_SIZE, "unread", true);
  const markAllReadMutation = useMarkAllNotificationsReadMutation();
  const [openingId, setOpeningId] = useState<string | null>(null);

  const notifications = data?.notifications ?? [];
  const unreadCount = counts?.unread ?? notifications.length;
  const hasUnread = unreadCount > 0;
  const isListLoading =
    (isLoading || isPending) && notifications.length === 0;

  function handleOpen(notification: NotificationItemType) {
    if (openingId) {
      return;
    }

    if (prefersReducedMotion()) {
      onOpenNotification(notification);
      return;
    }

    setOpeningId(notification.id);
    window.setTimeout(() => {
      onOpenNotification(notification);
      setOpeningId(null);
    }, NOTIFICATION_OPEN_MS);
  }

  function handleMarkAllRead() {
    if (markAllReadMutation.isPending || notifications.length === 0) {
      return;
    }

    markAllReadMutation.mutate();
  }

  return (
    <div
      className={`dropdown-panel absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,24rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg ${
        visible ? "dropdown-panel-visible" : ""
      }`}
      role="dialog"
      aria-label="Notifications"
    >
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        {isListLoading ? (
          <NotificationDropdownHeaderSkeleton />
        ) : (
          <>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
              <p className="text-xs text-gray-500">
                {hasUnread
                  ? `${unreadCount} unread`
                  : "All caught up"}
              </p>
            </div>
            {hasUnread ? (
              <button
                type="button"
                className="shrink-0 cursor-pointer text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={markAllReadMutation.isPending}
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            ) : null}
          </>
        )}
      </div>

      <div className="max-h-[min(24rem,60dvh)] overflow-y-auto py-1">
        {isListLoading ? (
          <NotificationDropdownSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <BellOff className="h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-600">Could not load notifications.</p>
            <p className="text-xs text-gray-500">
              Your connection and job alerts are still working in the background.
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty-state flex flex-col items-center gap-2 px-4 py-10 text-center">
            <BellOff className="h-8 w-8 text-gray-300" />
            <p className="text-sm font-medium text-gray-900">
              {hasUnread ? "No unread notifications" : "You're all caught up"}
            </p>
            <p className="text-xs text-gray-500">
              New connection requests, applications, and references will appear here.
            </p>
          </div>
        ) : (
          <>
            {notifications.map((notification, index) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onOpen={handleOpen}
                showDelete={false}
                animateIn={visible}
                enterDelayMs={index * 35}
                opening={openingId === notification.id}
              />
            ))}
            {isFetching && !isPending ? (
              <p className="border-t border-gray-100 px-4 py-2 text-center text-xs text-gray-400">
                Updating...
              </p>
            ) : null}
          </>
        )}
      </div>

      <div className="border-t border-gray-100 px-4 py-3">
        <Link
          href={NOTIFICATIONS_PATH}
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          View all notifications
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
