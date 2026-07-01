"use client";

import { Briefcase, Plus } from "lucide-react";
import { useState } from "react";

import { RecruiterActiveRolesSkeleton } from "@/components/recruiter/RecruiterActiveRolesSkeleton";
import { useRequiredMyRecruiterProfileData } from "@/components/recruiter/MyRecruiterProfileDataProvider";
import { RecruiterCreateJobModal } from "@/components/recruiter/RecruiterCreateJobModal";
import { RecruiterEditJobModal } from "@/components/recruiter/RecruiterEditJobModal";
import { RecruiterJobCard } from "@/components/recruiter/RecruiterJobCard";
import {
  useRecruiterJobsQuery,
  useRepostRecruiterJobMutation,
} from "@/lib/query/use-job-queries";

type RecruiterActiveRolesTabProps = {
  defaultCompanyName: string;
};

export function RecruiterActiveRolesTab({
  defaultCompanyName,
}: RecruiterActiveRolesTabProps) {
  const rawProfile = useRequiredMyRecruiterProfileData();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [repostingJobId, setRepostingJobId] = useState<string | null>(null);
  const repostMutation = useRepostRecruiterJobMutation();
  const { data, isPending, isError, error } = useRecruiterJobsQuery();
  const jobs = data?.jobs ?? [];
  const workTypes = data?.workTypes ?? [];
  const activeJobs = jobs.filter((job) => !job.isExpired);
  const expiredJobs = jobs.filter((job) => job.isExpired);

  async function handleRepost(jobId: string) {
    setRepostingJobId(jobId);
    const result = await repostMutation.mutateAsync(jobId);
    setRepostingJobId(null);

    if (!result.success) {
      window.alert(result.error);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Active Job Postings
        </h2>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto sm:justify-start"
        >
          <Plus className="h-4 w-4 shrink-0" />
          Post New Role
        </button>
      </div>

      {isPending ? <RecruiterActiveRolesSkeleton /> : null}

      {isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
          {error instanceof Error
            ? error.message
            : "Could not load job postings."}
        </div>
      ) : null}

      {!isPending && !isError && jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
          <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h3 className="mb-1 text-base font-semibold text-gray-900">
            No job postings yet
          </h3>
          <p className="mb-5 text-sm text-gray-500">
            Create your first role to start receiving applications from
            candidates.
          </p>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Post New Role
          </button>
        </div>
      ) : null}

      {!isPending && !isError && activeJobs.length > 0 ? (
        <div className="space-y-4">
          {activeJobs.map((role) => (
            <RecruiterJobCard
              key={role.id}
              role={role}
              onEdit={setEditingJobId}
            />
          ))}
        </div>
      ) : null}

      {!isPending && !isError && expiredJobs.length > 0 ? (
        <div className="mt-10">
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            Expired Postings
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            These roles are hidden from candidates. Re-post to list them again
            for 30 days, or edit the details before re-posting.
          </p>
          <div className="space-y-4">
            {expiredJobs.map((role) => (
              <RecruiterJobCard
                key={role.id}
                role={role}
                onEdit={setEditingJobId}
                onRepost={handleRepost}
                isReposting={repostingJobId === role.id}
              />
            ))}
          </div>
        </div>
      ) : null}

      <RecruiterCreateJobModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultCompanyName={defaultCompanyName}
        recruiterUserId={rawProfile.user.id}
        workTypes={workTypes}
      />

      <RecruiterEditJobModal
        jobId={editingJobId}
        open={Boolean(editingJobId)}
        onClose={() => setEditingJobId(null)}
        defaultCompanyName={defaultCompanyName}
        workTypes={workTypes}
      />
    </div>
  );
}
