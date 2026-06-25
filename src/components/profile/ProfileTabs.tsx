"use client";

import {
  Briefcase,
  FolderOpen,
  Lock,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { DocumentsTab } from "@/components/profile/tabs/DocumentsTab";
import { JobsTab } from "@/components/profile/tabs/JobsTab";
import { ReferencesTab } from "@/components/profile/tabs/ReferencesTab";
import { ProfileSectionEditButton } from "@/components/profile/edit/ProfileSectionEditButton";
import {
  candidateSectionHasContent,
  CANDIDATE_SECTION_COPY,
} from "@/components/profile/edit/profile-section-content";
import type { ProfileSectionId } from "@/components/profile/edit/types";
import type {
  ProfileTabId,
  ProfileVisibility,
} from "@/lib/profile/profile-visibility";
import type { CandidateProfileData } from "@/lib/profile/types";

type ProfileTabsProps = {
  profile: CandidateProfileData;
  visibility: ProfileVisibility;
  onEditSection?: (sectionId: ProfileSectionId) => void;
};

const tabs: Array<{
  id: ProfileTabId;
  label: string;
  icon: typeof Users;
}> = [
  { id: "references", label: "References", icon: Users },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "jobs", label: "Jobs", icon: Briefcase },
];

function LockedPrivateTabsPanel() {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <Lock className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mb-2 font-semibold text-gray-900">
        References, Documents & Jobs are private
      </h3>
      <p className="max-w-sm text-sm leading-relaxed text-gray-500">
        Connect with this candidate to request access to their verified
        reference profile and documents.
      </p>
    </div>
  );
}

export function ProfileTabs({ profile, visibility, onEditSection }: ProfileTabsProps) {
  const visibleTabs = tabs.filter((tab) =>
    visibility.visibleTabIds.includes(tab.id),
  );
  const [activeTab, setActiveTab] = useState<ProfileTabId>(
    visibleTabs[0]?.id ?? "references",
  );

  useEffect(() => {
    if (!visibility.visibleTabIds.includes(activeTab)) {
      setActiveTab(visibility.visibleTabIds[0] ?? "references");
    }
  }, [activeTab, visibility.visibleTabIds]);

  const isOwnProfile = visibility.showOwnerActions;

  function handleTabKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    tabId: ProfileTabId,
  ) {
    const currentIndex = visibleTabs.findIndex((tab) => tab.id === tabId);
    if (currentIndex < 0) {
      return;
    }

    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % visibleTabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + visibleTabs.length) % visibleTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = visibleTabs.length - 1;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    const nextTab = visibleTabs[nextIndex];
    setActiveTab(nextTab.id);
    document.getElementById(`profile-tab-${nextTab.id}`)?.focus();
  }

  function renderEditButton(sectionId: ProfileSectionId) {
    if (!onEditSection) {
      return null;
    }

    const copy = CANDIDATE_SECTION_COPY[sectionId];

    return (
      <ProfileSectionEditButton
        hasContent={candidateSectionHasContent(sectionId, profile)}
        sectionLabel={copy.label}
        onClick={() => onEditSection(sectionId)}
      />
    );
  }

  if (visibility.showLockedPrivateTabs) {
    return (
      <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200">
          <nav className="flex">
            {tabs.map(({ id, label, icon: Icon }) => (
              <div
                key={id}
                className="flex select-none items-center gap-2 px-4 py-4 text-sm font-medium text-gray-300 sm:px-6"
              >
                <Icon className="h-4 w-4" />
                {label}
              </div>
            ))}
          </nav>
          {visibility.showConnectPreview ? (
            <div className="px-4 sm:px-6">
              <span
                aria-hidden="true"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                <UserPlus className="h-4 w-4" />
                Connect
              </span>
            </div>
          ) : null}
        </div>
        <LockedPrivateTabsPanel />
      </div>
    );
  }

  if (visibleTabs.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200">
        <nav
          aria-label="Profile sections"
          className="flex overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
        >
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`profile-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={`profile-tabpanel-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors sm:px-6 ${
                  isSelected
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {visibleTabs.map((tab) => {
        if (activeTab !== tab.id) {
          return null;
        }

        return (
          <div
            key={tab.id}
            id={`profile-tabpanel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`profile-tab-${tab.id}`}
            className="p-4 sm:p-6"
          >
            {tab.id === "references" ? (
              <ReferencesTab
                isOwnProfile={isOwnProfile}
                profile={profile}
                hasReferenceAccess={visibility.visibleTabIds.includes(
                  "references",
                )}
              />
            ) : null}
            {tab.id === "documents" ? (
              <DocumentsTab
                documents={profile.documents}
                isOwnProfile={isOwnProfile}
                editButton={renderEditButton("documents")}
              />
            ) : null}
            {tab.id === "jobs" ? <JobsTab /> : null}
          </div>
        );
      })}
    </div>
  );
}
