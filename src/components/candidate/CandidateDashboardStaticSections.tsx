import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  Eye,
  TrendingUp,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/Skeleton";
import {
  DashboardStatCard,
  DashboardStatGrid,
} from "@/components/ui/DashboardStatCard";
import type { ConnectionCounts } from "@/lib/connections/connection.types";
import type { CandidateDashboardContext } from "@/lib/candidate/dashboard.types";
import {
  CANDIDATE_CONNECTIONS_PATH,
  CANDIDATE_JOBS_PATH,
  CANDIDATE_PROFILE_PATH,
} from "@/lib/auth/routes";
import { getInitials } from "@/lib/profile/format";
import type { ProfileCompletionItem } from "@/lib/profile/profile-completion";

type CandidateDashboardStatsProps = {
  profileCompletionPercent: number;
  connectionCounts: ConnectionCounts;
  applicationsCount: number;
  profileViewsCount: number;
};

type CandidateDashboardSidebarProps = {
  context: CandidateDashboardContext;
  profileCompletionPercent: number;
  profileCompletionItems: ProfileCompletionItem[];
  connectionCounts: ConnectionCounts;
  profileViewsCount: number;
};

export function CandidateDashboardStats({
  profileCompletionPercent,
  connectionCounts,
  applicationsCount,
  profileViewsCount,
}: CandidateDashboardStatsProps) {
  return (
    <DashboardStatGrid>
      <DashboardStatCard
        label="Profile Complete"
        value={`${profileCompletionPercent}%`}
        icon={UserCircle}
        color="bg-green-50 text-green-600"
        href={CANDIDATE_PROFILE_PATH}
      />
      <DashboardStatCard
        label="Connections"
        value={String(connectionCounts.connected)}
        icon={Users}
        color="bg-blue-50 text-blue-600"
        href={CANDIDATE_CONNECTIONS_PATH}
      />
      <DashboardStatCard
        label="Jobs Applied"
        value={String(applicationsCount)}
        icon={Briefcase}
        color="bg-amber-50 text-amber-600"
        href={CANDIDATE_JOBS_PATH}
      />
      <DashboardStatCard
        label="Recruiter Views"
        value={String(profileViewsCount)}
        icon={Eye}
        color="bg-purple-50 text-purple-600"
        href={CANDIDATE_PROFILE_PATH}
      />
    </DashboardStatGrid>
  );
}

function ProfileCompletionSidebar({
  percent,
  items,
}: {
  percent: number;
  items: ProfileCompletionItem[];
}) {
  const incompleteItems = items.filter((item) => !item.done).slice(0, 4);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Profile Completion</h2>
        <Link
          href={CANDIDATE_PROFILE_PATH}
          className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          Edit
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 min-w-0 flex-1 rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="shrink-0 text-sm font-bold text-gray-900">{percent}%</span>
      </div>

      {percent >= 100 ? (
        <p className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
          Your profile is complete. Keep it updated to stay visible to recruiters.
        </p>
      ) : incompleteItems.length > 0 ? (
        <div className="space-y-2.5">
          {incompleteItems.map((item) => (
            <div key={item.label} className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-gray-200" />
              <span className="min-w-0 flex-1 text-xs leading-snug text-gray-600">
                {item.label}
              </span>
              <span className="shrink-0 text-xs font-medium text-blue-600">
                +{item.weight}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Add more details to strengthen your profile.
        </p>
      )}

      <Link
        href={CANDIDATE_PROFILE_PATH}
        className="mt-4 block w-full rounded-xl border border-blue-200 py-2.5 text-center text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
      >
        Complete Profile
      </Link>
    </div>
  );
}

function PendingConnectionsCard({ counts }: { counts: ConnectionCounts }) {
  if (counts.pendingReceived === 0 && counts.pendingSent === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Connection Requests</h2>
        <Link
          href={CANDIDATE_CONNECTIONS_PATH}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {counts.pendingReceived > 0 ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            {counts.pendingReceived} waiting for you
          </span>
        ) : null}
        {counts.pendingSent > 0 ? (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            {counts.pendingSent} pending sent
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function CandidateDashboardSidebar({
  context,
  profileCompletionPercent,
  profileCompletionItems,
  connectionCounts,
  profileViewsCount,
}: CandidateDashboardSidebarProps) {
  const candidateInitials = getInitials(context.firstName, context.lastName);
  const candidateName = `${context.firstName} ${context.lastName}`.trim();

  return (
    <div className="space-y-5">
      <ProfileCompletionSidebar
        percent={profileCompletionPercent}
        items={profileCompletionItems}
      />

      <PendingConnectionsCard counts={connectionCounts} />

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          {context.profilePictureUrl ? (
            <img
              src={context.profilePictureUrl}
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <span className="font-semibold text-blue-700">{candidateInitials}</span>
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{candidateName}</p>
            <p className="text-xs text-gray-500">
              {context.title ?? "Candidate"}
            </p>
          </div>
        </div>
        <Link
          href={CANDIDATE_PROFILE_PATH}
          className="block w-full rounded-xl border border-gray-300 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          View My Profile
        </Link>
      </div>

      {profileCompletionPercent < 100 ? (
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white">
          <TrendingUp className="mb-3 h-8 w-8 text-blue-200" />
          <p className="mb-1 font-semibold">Boost your visibility</p>
          <p className="text-4xl font-bold">{100 - profileCompletionPercent}%</p>
          <p className="mt-1 text-sm text-blue-100">
            left to complete your profile and stand out to recruiters
          </p>
        </div>
      ) : profileViewsCount > 0 ? (
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white">
          <Eye className="mb-3 h-8 w-8 text-blue-200" />
          <p className="mb-1 font-semibold">Recruiters are noticing you</p>
          <p className="text-4xl font-bold">{profileViewsCount}</p>
          <p className="mt-1 text-sm text-blue-100">
            recruiter{profileViewsCount === 1 ? "" : "s"} viewed your profile
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function CandidateDashboardStatsSkeleton() {
  return (
    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 bg-white p-6"
        >
          <Skeleton className="mb-4 h-10 w-10 rounded-xl" />
          <Skeleton className="mb-2 h-9 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}
