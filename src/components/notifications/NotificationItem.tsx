"use client";

import {
  Briefcase,
  CheckCircle,
  FileText,
  Share2,
  UserCheck,
  UserPlus,
  UserX,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { formatNotificationTime } from "@/lib/notifications/format-notification-time";
import type {
  NotificationItem as NotificationItemType,
  NotificationType,
} from "@/lib/notifications/notification.types";

type NotificationItemProps = {
  notification: NotificationItemType;
  onOpen: (notification: NotificationItemType) => void;
  onDelete?: (notificationId: string) => void;
  deleting?: boolean;
  showDelete?: boolean;
  animateIn?: boolean;
  enterDelayMs?: number;
  opening?: boolean;
};

type NotificationVisual = {
  Icon: LucideIcon;
  iconClassName: string;
};

function getNotificationVisual(type: NotificationType): NotificationVisual {
  switch (type) {
    case "connection_request_received":
      return { Icon: UserPlus, iconClassName: "bg-blue-50 text-blue-600" };
    case "connection_request_accepted":
      return { Icon: UserCheck, iconClassName: "bg-green-50 text-green-600" };
    case "connection_request_rejected":
      return { Icon: UserX, iconClassName: "bg-gray-100 text-gray-500" };
    case "job_application_received":
      return { Icon: Briefcase, iconClassName: "bg-indigo-50 text-indigo-600" };
    case "job_application_status_updated":
      return { Icon: CheckCircle, iconClassName: "bg-purple-50 text-purple-600" };
    case "reference_submitted":
      return { Icon: FileText, iconClassName: "bg-amber-50 text-amber-600" };
    case "reference_verified":
      return { Icon: CheckCircle, iconClassName: "bg-green-50 text-green-600" };
    case "reference_rejected":
      return { Icon: XCircle, iconClassName: "bg-red-50 text-red-600" };
    case "reference_grant_received":
      return { Icon: Share2, iconClassName: "bg-teal-50 text-teal-600" };
  }
}

export function NotificationItem({
  notification,
  onOpen,
  onDelete,
  deleting = false,
  showDelete = true,
  animateIn,
  enterDelayMs = 0,
  opening = false,
}: NotificationItemProps) {
  const isUnread = !notification.readAt;
  const { Icon, iconClassName } = getNotificationVisual(notification.type);
  const usesMotion = animateIn !== undefined || opening;

  const animationClassName = [
    usesMotion ? "notification-item-motion" : "",
    animateIn !== undefined && !opening
      ? animateIn
        ? "notification-item-enter-visible"
        : "notification-item-enter"
      : "",
    opening ? "notification-item-opening" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const animationStyle =
    usesMotion && animateIn
      ? {
          transitionDelay: `${enterDelayMs}ms`,
        }
      : undefined;

  return (
    <div
      className={`group relative px-2 first:pt-2 last:pb-2 ${animationClassName}`}
      style={animationStyle}
    >
      <button
        type="button"
        disabled={opening}
        className={`flex w-full cursor-pointer gap-3 rounded-lg px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-default ${
          showDelete ? "pr-10" : ""
        } ${
          isUnread
            ? "bg-blue-50/60 hover:bg-blue-50"
            : "bg-transparent hover:bg-gray-50"
        }`}
        onClick={() => onOpen(notification)}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
          aria-hidden="true"
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p
              className={`text-sm text-gray-900 ${
                isUnread ? "font-semibold" : "font-medium"
              }`}
            >
              {notification.title}
            </p>
            {isUnread ? (
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600"
                aria-hidden="true"
              />
            ) : null}
          </div>
          {notification.body ? (
            <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-gray-600">
              {notification.body}
            </p>
          ) : null}
          <p className="mt-1.5 text-xs text-gray-400">
            {formatNotificationTime(notification.createdAt)}
          </p>
        </div>
      </button>

      {showDelete && onDelete ? (
        <button
          type="button"
          className="absolute right-4 top-4 shrink-0 cursor-pointer rounded-md p-1 text-gray-400 opacity-100 transition-all hover:bg-gray-200/70 hover:text-gray-700 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-500/40 sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="Remove notification"
          disabled={deleting}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(notification.id);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
