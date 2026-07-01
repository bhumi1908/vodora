"use client";

import { useState } from "react";

import { IssueGrid } from "./IssueGrid";
import { ISSUES_BY_TAB } from "./constants";
import type { TabItem } from "./constants";

interface TrustTabsProps {
  readonly tabs: readonly TabItem[];
  readonly defaultTabId: string;
}

export function TrustTabs({ tabs, defaultTabId }: TrustTabsProps) {
  const [selectedTab, setSelectedTab] = useState(defaultTabId);
  const issues = ISSUES_BY_TAB[selectedTab] ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div
        role="tablist"
        aria-label="Pain point categories"
        className="flex justify-center"
      >
        <div className="flex gap-1 rounded-full bg-white p-1">
          {tabs.map((tab) => {
            const isActive = tab.id === selectedTab;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setSelectedTab(tab.id)}
                className={[
                  "rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D8B8A] focus-visible:ring-offset-2",
                  isActive
                    ? "bg-[#1D8B8A] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <IssueGrid issues={issues} />
    </div>
  );
}
