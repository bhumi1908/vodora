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
  appliedLabel?: string;
  viewJobHref?: string;
};

export function AppliedJobCard({
  job,
  status = "Applied",
  referencesShared = 2,
  appliedLabel,
  viewJobHref = CANDIDATE_JOBS_PATH,
}: AppliedJobCardProps) {
  const statusStyle =
    JOB_APPLICATION_STATUS_STYLES[status] ??
    JOB_APPLICATION_STATUS_STYLES.Applied;

  return (
    <div className="min-w-0 rounded-xl border border-gray-200 p-4 transition-shadow hover:shadow-md sm:rounded-2xl sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 sm:h-12 sm:w-12">
            <span className="text-xs font-bold text-blue-700 sm:text-sm">
              {job.recruiter.avatar}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
                {job.title}
              </h3>
              {job.urgent ? (
                <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                  URGENT
                </span>
              ) : null}
            </div>
            <p className="mb-2 text-sm text-gray-600">{job.company}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500 sm:gap-x-4 sm:gap-y-2">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Briefcase className="h-3 w-3 shrink-0" />
                {job.type}
              </span>
              <span className="inline-flex items-center gap-1">
                <DollarSign className="h-3 w-3 shrink-0" />
                {job.salary}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
                Applied {appliedLabel ?? job.posted}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3 sm:w-auto sm:shrink-0 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyle}`}
          >
            {status === "Applied" ? (
              <CheckCircle className="mr-1 h-3 w-3 shrink-0" />
            ) : null}
            {status}
          </span>
          <Link
            href={viewJobHref}
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            View Job
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0 wrap-break-word">
            Recruiter:{" "}
            <span className="font-medium text-gray-700">
              {job.recruiter.name}
            </span>{" "}
            · {job.recruiter.company}
          </span>
          {job.recruiter.verified ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 text-green-600">
              <CheckCircle className="h-3 w-3" />
              Verified
            </span>
          ) : null}
        </div>
        <div className="shrink-0 text-xs text-gray-400 sm:text-right">
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
