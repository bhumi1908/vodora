import {
  NOTIFICATION_MAX_PAGE_SIZE,
  NOTIFICATION_PAGE_SIZE,
} from "@/lib/notifications/notification-options";
import { parseNotificationReadFilter } from "@/lib/notifications/parse-notification-filter";
import type { NotificationReadFilter } from "@/lib/notifications/notification.types";

export type NotificationListQuery = {
  page: number;
  limit: number;
  filter: NotificationReadFilter;
};

export function parseNotificationListQuery(url: URL): NotificationListQuery {
  const rawPage = Number(url.searchParams.get("page") ?? "1");
  const rawLimit = Number(url.searchParams.get("limit") ?? String(NOTIFICATION_PAGE_SIZE));
  const rawFilter = url.searchParams.get("filter");
  const unreadOnly = url.searchParams.get("unreadOnly") === "true";

  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), NOTIFICATION_MAX_PAGE_SIZE)
      : NOTIFICATION_PAGE_SIZE;

  const filter =
    rawFilter !== null
      ? parseNotificationReadFilter(rawFilter)
      : unreadOnly
        ? "unread"
        : "all";

  return { page, limit, filter };
}
