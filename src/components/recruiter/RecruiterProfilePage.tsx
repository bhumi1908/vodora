"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { CollectReferenceTab } from "@/components/recruiter/CollectReferenceTab";
import { RecruiterReferenceHistoryTab } from "@/components/recruiter/RecruiterReferenceHistoryTab";
import { RecruiterActiveRolesTab } from "@/components/recruiter/RecruiterActiveRolesTab";
import {
  useMyRecruiterProfileLoading,
  useRequiredMyRecruiterProfileData,
} from "@/components/recruiter/MyRecruiterProfileDataProvider";
import { RecruiterProfileSectionModal } from "@/components/recruiter/edit/RecruiterProfileSectionModal";
import { ProfileViewSkeleton } from "@/components/profile/ProfileViewSkeleton";
import {
  RecruiterProfileView,
  type RecruiterProfileTab,
} from "@/components/recruiter/RecruiterProfileView";
import {
  RECRUITER_CONNECTIONS_PATH,
  RECRUITER_SEARCH_PATH,
} from "@/lib/auth/routes";
import { formatRecruiterJobStatsForDisplay } from "@/lib/jobs/format-recruiter-job-stats";
import { useRecruiterJobsQuery } from "@/lib/query/use-job-queries";
import { resolveRecruiterProfileVisibility } from "@/lib/recruiter/recruiter-profile-visibility";
import { transformOwnRecruiterProfileToView } from "@/lib/recruiter/transform-own-recruiter-profile";
import { transformOwnRecruiterProfileToEdit } from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";
import type { RecruiterProfileSectionId } from "@/components/profile/edit/profile-section-content";

const OWN_PROFILE_TABS: RecruiterProfileTab[] = [
  "overview",
  "roles",
  "collect",
  "history",
];

function getInitialProfileTab(tabParam: string | null): RecruiterProfileTab {
  if (
    tabParam === "roles" ||
    tabParam === "collect" ||
    tabParam === "history"
  ) {
    return tabParam;
  }

  return "overview";
}

export function RecruiterProfilePage() {
  const searchParams = useSearchParams();
  const rawProfile = useRequiredMyRecruiterProfileData();
  const isLoading = useMyRecruiterProfileLoading();
  const { data: recruiterJobsData, isPending: isJobsPending } =
    useRecruiterJobsQuery();
  const profile = useMemo(
    () => transformOwnRecruiterProfileToView(rawProfile),
    [rawProfile],
  );
  const editProfile = useMemo(
    () => transformOwnRecruiterProfileToEdit(rawProfile),
    [rawProfile],
  );
  const jobStats = useMemo(
    () =>
      formatRecruiterJobStatsForDisplay(
        recruiterJobsData?.stats ?? {
          totalPlacements: 0,
          activeRoles: 0,
          candidatesWorkedWith: 0,
          avgTimeToHireDays: null,
          hiringFasterPercent: null,
          hoursSavedThisMonth: 0,
        },
      ),
    [recruiterJobsData?.stats],
  );
  const [activeTab, setActiveTab] = useState<RecruiterProfileTab>(() =>
    getInitialProfileTab(searchParams.get("tab")),
  );
  const [activeEditSection, setActiveEditSection] =
    useState<RecruiterProfileSectionId | null>(null);

  const visibility = useMemo(
    () => resolveRecruiterProfileVisibility({ isOwnProfile: true }),
    [],
  );

  if (isLoading || !profile || !editProfile) {
    return <ProfileViewSkeleton />;
  }

  return (
    <>
      <RecruiterProfileView
        profile={profile}
        visibility={visibility}
        jobStats={jobStats}
        isStatsPending={isJobsPending}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        availableTabs={OWN_PROFILE_TABS}
        editProfile={editProfile}
        onEditSection={setActiveEditSection}
        onPhotoEdit={() => setActiveEditSection("photo")}
        headerActions={
          <>
            <Link
              href={RECRUITER_SEARCH_PATH}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:justify-start"
            >
              <Users className="h-4 w-4 shrink-0" />
              Find Candidates
            </Link>
            <Link
              href={RECRUITER_CONNECTIONS_PATH}
              className="flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 sm:justify-start"
            >
              Connections
            </Link>
          </>
        }
        activeRolesTab={
          <RecruiterActiveRolesTab defaultCompanyName={profile.company ?? ""} />
        }
        collectReferenceTab={
          <CollectReferenceTab
            recruiterUserId={rawProfile.user.id}
            recruiterName={profile.name}
            companyName={profile.company}
          />
        }
        referenceHistoryTab={
          <RecruiterReferenceHistoryTab
            onCollectReference={() => setActiveTab("collect")}
          />
        }
      />

      <RecruiterProfileSectionModal
        sectionId={activeEditSection}
        initialProfile={editProfile}
        onClose={() => setActiveEditSection(null)}
      />
    </>
  );
}
