import type { NotificationItem, NotificationType } from "@/lib/notifications/notification.types";
import type { Json } from "@/lib/supabase/database.types";

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  action_url: string;
  entity_type: string | null;
  entity_id: string | null;
  actor_user_id: string | null;
  metadata: Json;
  read_at: string | null;
  created_at: string;
};

function normalizeMetadata(value: Json): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

export function mapNotificationRow(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    type: row.type as NotificationType,
    title: row.title,
    body: row.body,
    actionUrl: row.action_url,
    entityType: row.entity_type,
    entityId: row.entity_id,
    actorUserId: row.actor_user_id,
    metadata: normalizeMetadata(row.metadata),
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}
