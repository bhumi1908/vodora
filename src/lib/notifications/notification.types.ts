export const NOTIFICATION_TYPES = [
  "connection_request_received",
  "connection_request_accepted",
  "connection_request_rejected",
  "job_application_received",
  "job_application_status_updated",
  "reference_submitted",
  "reference_verified",
  "reference_rejected",
  "reference_grant_received",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  actionUrl: string;
  entityType: string | null;
  entityId: string | null;
  actorUserId: string | null;
  metadata: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};

export type NotificationListResult = {
  notifications: NotificationItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type NotificationCounts = {
  unread: number;
  total: number;
};

export type NotificationReadFilter = "all" | "unread" | "read";
