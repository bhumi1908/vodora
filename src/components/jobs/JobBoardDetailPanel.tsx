"use client";

import {
  Briefcase,
  Building2,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  MapPin,
  Send,
} from "lucide-react";

import { JobRecruiterAvatar } from "@/components/jobs/JobRecruiterAvatar";
import type { CandidateJob } from "@/lib/jobs/candidate-jobs.types";

type JobBoardDetailPanelProps = {
  job: CandidateJob;
  applied: boolean;
  onApply: () => void;
};

function JobDetailList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="mb-3 font-semibold text-gray-900">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm text-gray-700"
          >
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function JobBoardDetailPanel({
  job,
  applied,
  onApply,
}: JobBoardDetailPanelProps) {
  return (
    <div className="min-w-0 w-full">
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold text-gray-900">
                {job.title}
              </h2>
              {job.urgent ? (
                <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                  Urgent
                </span>
              ) : null}
            </div>
            <p className="mb-3 font-medium text-gray-600">{job.company}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                {job.type}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                {job.salary}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Posted {job.posted}
              </span>
            </div>
          </div>

          {applied ? (
            <span className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-6 py-3 text-sm font-semibold text-green-700">
              <CheckCircle className="h-4 w-4" />
              Applied
            </span>
          ) : (
            <button
              type="button"
              onClick={onApply}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
              Apply Now
            </button>
          )}
        </div>

        <div className="mb-6">
          <h3 className="mb-3 font-semibold text-gray-900">About the Role</h3>
          <p className="leading-relaxed text-gray-600">{job.description}</p>
        </div>

        <JobDetailList title="Responsibilities" items={job.responsibilities} />

        <JobDetailList title="Requirements" items={job.requirements} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 font-semibold text-gray-900">Posted by</h3>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <JobRecruiterAvatar recruiter={job.recruiter} />
          <div className="flex-1">
            <div className="mb-0.5 flex flex-wrap items-center gap-2">
              <p className="font-semibold text-gray-900">{job.recruiter.name}</p>
              {job.recruiter.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-700">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </span>
              ) : null}
            </div>
            {job.recruiter.title ? (
              <p className="text-sm text-gray-600">{job.recruiter.title}</p>
            ) : null}
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <Building2 className="h-3.5 w-3.5" />
              {job.recruiter.company}
            </p>
          </div>
          {!applied ? (
            <button
              type="button"
              onClick={onApply}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Apply Now
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
