"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import type { NotificationItem } from "@/lib/notifications/notification.types";
import {
  useMarkNotificationReadMutation,
  useNotificationCountsQuery,
} from "@/lib/query/use-notification-queries";

const DROPDOWN_ANIMATION_MS = 200;

type NotificationBellProps = {
  className?: string;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function NotificationBell({ className = "" }: NotificationBellProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const { data: counts } = useNotificationCountsQuery();
  const markReadMutation = useMarkNotificationReadMutation();

  const unreadCount = counts?.unread ?? 0;
  const badgeLabel =
    unreadCount > 9 ? "9+" : unreadCount > 0 ? String(unreadCount) : null;

  useEffect(() => {
    if (open) {
      setMounted(true);

      if (prefersReducedMotion()) {
        setVisible(true);
        return;
      }

      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setVisible(true);
        });
      });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    setVisible(false);
  }, [open]);

  useEffect(() => {
    if (!mounted || visible) {
      return;
    }

    const duration = prefersReducedMotion() ? 0 : DROPDOWN_ANIMATION_MS;
    const timer = window.setTimeout(() => {
      setMounted(false);
    }, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [mounted, visible]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function handleToggle() {
    setOpen((current) => !current);
  }

  function handleOpenNotification(notification: NotificationItem) {
    if (!notification.readAt) {
      markReadMutation.mutate({ notificationId: notification.id, read: true });
    }

    setOpen(false);
    router.push(notification.actionUrl);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "Notifications"
        }
        onClick={handleToggle}
      >
        <Bell className="h-5 w-5" />
        {badgeLabel ? (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {badgeLabel}
          </span>
        ) : null}
      </button>

      {mounted ? (
        <NotificationDropdown
          visible={visible}
          onOpenNotification={handleOpenNotification}
        />
      ) : null}
    </div>
  );
}
