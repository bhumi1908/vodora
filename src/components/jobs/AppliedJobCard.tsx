"use client";

import Link from "next/link";
import {
  Briefcase,
  Building2,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  MapPin,
  Search,
} from "lucide-react";

import {
  JOB_APPLICATION_STATUS_STYLES,
} from "@/lib/jobs/candidate-jobs-static-data";
import type { CandidateJob, JobApplicationStatus } from "@/lib/jobs/candidate-jobs.types";
import { CANDIDATE_JOBS_PATH } from "@/lib/auth/routes";

type AppliedJobCardProps = {
  job: CandidateJob;
  status?: JobApplicationStatus;
  referencesShared?: number;
  viewJobHref?: string;
};

export function AppliedJobCard({
  job,
  status = "Applied",
  referencesShared = 2,
  viewJobHref = CANDIDATE_JOBS_PATH,
}: AppliedJobCardProps) {
  const statusStyle =
    JOB_APPLICATION_STATUS_STYLES[status] ??
    JOB_APPLICATION_STATUS_STYLES.Applied;

  return (
    <div className="rounded-2xl border border-gray-200 p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
            <span className="text-sm font-bold text-blue-700">
              {job.recruiter.avatar}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-gray-900">{job.title}</h3>
              {job.urgent ? (
                <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                  URGENT
                </span>
              ) : null}
            </div>
            <p className="mb-2 text-sm text-gray-600">{job.company}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {job.type}
              </span>
              <span className="inline-flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {job.salary}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Applied {job.posted}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyle}`}
          >
            {status === "Applied" ? (
              <CheckCircle className="mr-1 inline h-3 w-3" />
            ) : null}
            {status}
          </span>
          <Link
            href={viewJobHref}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            View Job
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Building2 className="h-3.5 w-3.5" />
          <span>
            Recruiter:{" "}
            <span className="font-medium text-gray-700">
              {job.recruiter.name}
            </span>{" "}
            · {job.recruiter.company}
          </span>
          {job.recruiter.verified ? (
            <span className="inline-flex items-center gap-0.5 text-green-600">
              <CheckCircle className="h-3 w-3" />
              Verified
            </span>
          ) : null}
        </div>
        <div className="text-xs text-gray-400">
          Resume + Cover letter + {referencesShared} References shared
        </div>
      </div>
    </div>
  );
}

export function AppliedJobsEmptyState() {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
        <Briefcase className="h-8 w-8 text-blue-400" />
      </div>
      <h3 className="mb-2 font-semibold text-gray-900">No applications yet</h3>
      <p className="mb-5 text-sm text-gray-500">
        Browse the job board and apply to roles that match your profile.
      </p>
      <Link
        href={CANDIDATE_JOBS_PATH}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        <Search className="h-4 w-4" />
        Browse Jobs
      </Link>
    </div>
  );
}
