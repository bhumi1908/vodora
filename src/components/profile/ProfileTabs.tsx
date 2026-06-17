"use client";

import {
  Award,
  Briefcase,
  FileText,
  FolderOpen,
  GraduationCap,
  Users,
} from "lucide-react";
import { useState } from "react";

import { DocumentsTab } from "@/components/profile/tabs/DocumentsTab";
import { EducationTab } from "@/components/profile/tabs/EducationTab";
import { ExperienceTab } from "@/components/profile/tabs/ExperienceTab";
import { JobsTab } from "@/components/profile/tabs/JobsTab";
import { OverviewTab } from "@/components/profile/tabs/OverviewTab";
import { ReferencesTab } from "@/components/profile/tabs/ReferencesTab";
import { SkillsTab } from "@/components/profile/tabs/SkillsTab";
import type { CandidateProfileData } from "@/lib/profile/types";

type ProfileTabsProps = {
  profile: CandidateProfileData;
  isOwnProfile: boolean;
};

type TabType =
  | "overview"
  | "experience"
  | "education"
  | "skills"
  | "references"
  | "documents"
  | "jobs";

const tabs: Array<{
  id: TabType;
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

export function ProfileTabs({ profile, isOwnProfile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors sm:px-6 ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "overview" ? (
          <OverviewTab
            about={profile.about}
            availabilityStatus={profile.availabilityStatus}
            availabilityStart={profile.availabilityStart}
          />
        ) : null}
        {activeTab === "experience" ? (
          <ExperienceTab experience={profile.experience} />
        ) : null}
        {activeTab === "education" ? (
          <EducationTab education={profile.education} />
        ) : null}
        {activeTab === "skills" ? <SkillsTab skills={profile.skills} /> : null}
        {activeTab === "references" ? (
          <ReferencesTab isOwnProfile={isOwnProfile} />
        ) : null}
        {activeTab === "documents" ? (
          <DocumentsTab documents={profile.documents} isOwnProfile={isOwnProfile} />
        ) : null}
        {activeTab === "jobs" ? <JobsTab /> : null}
      </div>
    </div>
  );
}
