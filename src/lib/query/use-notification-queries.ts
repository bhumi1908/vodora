import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { NOTIFICATION_PAGE_SIZE } from "@/lib/notifications/notification-options";
import type { NotificationReadFilter } from "@/lib/notifications/notification.types";
import {
  deleteAllNotificationsRequest,
  deleteNotificationRequest,
  fetchNotificationCounts,
  fetchNotificationList,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
} from "@/lib/query/notification-fetchers";
import { notificationKeys } from "@/lib/query/notification-keys";
import { syncNotificationQueries } from "@/lib/notifications/sync-notification-queries";

export function useNotificationCountsQuery(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.counts(),
    queryFn: fetchNotificationCounts,
    enabled,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useNotificationsQuery(
  page = 1,
  limit = NOTIFICATION_PAGE_SIZE,
  filter: NotificationReadFilter = "all",
  enabled = true,
) {
  return useQuery({
    queryKey: notificationKeys.list(page, limit, filter),
    queryFn: () => fetchNotificationList(page, limit, filter),
    enabled,
    retry: false,
  });
}

function invalidateNotificationQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void syncNotificationQueries(queryClient);
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      notificationId,
      read,
    }: {
      notificationId: string;
      read: boolean;
    }) => markNotificationReadRequest(notificationId, read),
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsReadRequest,
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotificationRequest(notificationId),
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
  });
}

export function useDeleteAllNotificationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllNotificationsRequest,
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
  });
}
