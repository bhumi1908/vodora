"use client";

import {
  Award,
  Briefcase,
  FileText,
  FolderOpen,
  GraduationCap,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { DocumentsTab } from "@/components/profile/tabs/DocumentsTab";
import { EducationTab } from "@/components/profile/tabs/EducationTab";
import { ExperienceTab } from "@/components/profile/tabs/ExperienceTab";
import { JobsTab } from "@/components/profile/tabs/JobsTab";
import { OverviewTab } from "@/components/profile/tabs/OverviewTab";
import { ReferencesTab } from "@/components/profile/tabs/ReferencesTab";
import { SkillsTab } from "@/components/profile/tabs/SkillsTab";
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
  icon: typeof FileText;
}> = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Award },
  { id: "references", label: "References", icon: Users },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "jobs", label: "Jobs", icon: Briefcase },
];

export function ProfileTabs({ profile, visibility, onEditSection }: ProfileTabsProps) {
  const visibleTabs = tabs.filter((tab) =>
    visibility.visibleTabIds.includes(tab.id),
  );
  const [activeTab, setActiveTab] = useState<ProfileTabId>(
    visibleTabs[0]?.id ?? "overview",
  );

  useEffect(() => {
    if (!visibility.visibleTabIds.includes(activeTab)) {
      setActiveTab(visibility.visibleTabIds[0] ?? "overview");
    }
  }, [activeTab, visibility.visibleTabIds]);

  const isOwnProfile = visibility.showOwnerActions;

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

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200">
        {visibility.showConnectPreview ? (
          <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3 sm:hidden">
            <span
              aria-hidden="true"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              <UserPlus className="h-4 w-4" />
              Connect
            </span>
          </div>
        ) : null}

        <div className="flex items-stretch justify-between gap-2 sm:gap-4">
          <nav className="flex min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-medium transition-colors sm:gap-2 sm:px-6 sm:py-4 sm:text-sm ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {visibility.showConnectPreview ? (
            <div className="hidden shrink-0 items-center px-4 sm:flex sm:px-6">
              <span
                aria-hidden="true"
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white"
              >
                <UserPlus className="h-4 w-4" />
                Connect
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {activeTab === "overview" ? (
          <OverviewTab
            about={profile.about}
            availabilityStatus={profile.availabilityStatus}
            availabilityStart={profile.availabilityStart}
            showAvailability={visibility.showAvailability}
            showRestrictedNotice={visibility.showRestrictedNotice}
            editButton={renderEditButton("overview")}
          />
        ) : null}
        {activeTab === "experience" ? (
          <ExperienceTab
            experience={profile.experience}
            editButton={renderEditButton("experience")}
          />
        ) : null}
        {activeTab === "education" ? (
          <EducationTab
            education={profile.education}
            editButton={renderEditButton("education")}
          />
        ) : null}
        {activeTab === "skills" ? (
          <SkillsTab skills={profile.skills} editButton={renderEditButton("skills")} />
        ) : null}
        {activeTab === "references" ? (
          <ReferencesTab
            isOwnProfile={isOwnProfile}
            profile={profile}
            hasReferenceAccess={visibility.visibleTabIds.includes("references")}
          />
        ) : null}
        {activeTab === "documents" ? (
          <DocumentsTab
            documents={profile.documents}
            isOwnProfile={isOwnProfile}
            editButton={renderEditButton("documents")}
          />
        ) : null}
        {activeTab === "jobs" ? <JobsTab /> : null}
      </div>
    </div>
  );
}
