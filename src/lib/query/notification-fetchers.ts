import type {
  NotificationCounts,
  NotificationListResult,
  NotificationReadFilter,
} from "@/lib/notifications/notification.types";
import { NOTIFICATION_PAGE_SIZE } from "@/lib/notifications/notification-options";

type ApiListResponse = {
  success: boolean;
  error?: string;
} & Partial<NotificationListResult>;

type ApiCountsResponse = {
  success: boolean;
  error?: string;
  counts?: NotificationCounts;
};

type ApiMutationResponse = {
  success: boolean;
  error?: string;
  read?: boolean;
};

function buildListUrl(
  page: number,
  limit: number,
  filter: NotificationReadFilter,
): string {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (filter !== "all") {
    params.set("filter", filter);
  }

  return `/api/notifications?${params.toString()}`;
}

export async function fetchNotificationList(
  page = 1,
  limit = NOTIFICATION_PAGE_SIZE,
  filter: NotificationReadFilter = "all",
): Promise<NotificationListResult> {
  const response = await fetch(buildListUrl(page, limit, filter));
  const payload = (await response.json()) as ApiListResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load notifications.");
  }

  return {
    notifications: payload.notifications ?? [],
    totalCount: payload.totalCount ?? 0,
    page: payload.page ?? page,
    limit: payload.limit ?? limit,
    totalPages: payload.totalPages ?? 0,
  };
}

export async function fetchNotificationCounts(): Promise<NotificationCounts> {
  const response = await fetch("/api/notifications/counts");
  const payload = (await response.json()) as ApiCountsResponse;

  if (!response.ok || !payload.success || !payload.counts) {
    throw new Error(payload.error ?? "Could not load notification counts.");
  }

  return payload.counts;
}

export async function markNotificationReadRequest(
  notificationId: string,
  read: boolean,
): Promise<void> {
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ read }),
  });
  const payload = (await response.json()) as ApiMutationResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not update notification.");
  }
}

export async function markAllNotificationsReadRequest(): Promise<void> {
  const response = await fetch("/api/notifications/read-all", {
    method: "PATCH",
  });
  const payload = (await response.json()) as ApiMutationResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not mark notifications as read.");
  }
}

export async function deleteNotificationRequest(notificationId: string): Promise<void> {
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: "DELETE",
  });
  const payload = (await response.json()) as ApiMutationResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not delete notification.");
  }
}

export async function deleteAllNotificationsRequest(): Promise<void> {
  const response = await fetch("/api/notifications", {
    method: "DELETE",
  });
  const payload = (await response.json()) as ApiMutationResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not clear notifications.");
  }
}
