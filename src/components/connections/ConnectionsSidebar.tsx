"use client";

import { CheckCircle2, Inbox, Send } from "lucide-react";

import type { ConnectionCounts, ConnectionTab } from "@/lib/connections/connection.types";

const SIDEBAR_TABS: {
  id: ConnectionTab;
  label: string;
  icon: typeof Inbox;
  iconBg: string;
  iconColor: string;
}[] = [
    {
      id: "received",
      label: "Pending requests",
      icon: Inbox,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      id: "sent",
      label: "Pending sent",
      icon: Send,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      id: "connected",
      label: "Connected",
      icon: CheckCircle2,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
  ];

type ConnectionsSidebarProps = {
  tab: ConnectionTab;
  counts: ConnectionCounts | undefined;
  onTabChange: (tab: ConnectionTab) => void;
};

function getTabCount(
  tabId: ConnectionTab,
  counts: ConnectionCounts | undefined,
): number {
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

export function ConnectionsSidebar({
  tab,
  counts,
  onTabChange,
}: ConnectionsSidebarProps) {
  return (
    <aside className="w-full shrink-0 lg:w-64 lg:self-start">
      <nav
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        aria-label="Manage connections"
      >
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Manage connections
          </h2>
        </div>
        <ul className="divide-y divide-gray-100" role="tablist">
          {SIDEBAR_TABS.map((item) => {
            const active = tab === item.id;
            const count = getTabCount(item.id, counts);
            const TabIcon = item.icon;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onTabChange(item.id)}
                  className={`flex w-full items-center gap-3 px-5 py-3.5 text-left text-sm transition-colors hover:bg-gray-50 ${active
                    ? "bg-blue-50 font-semibold text-blue-600"
                    : "text-gray-700"
                    }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor}`}
                  >
                    <TabIcon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">{item.label}</span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${active
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
