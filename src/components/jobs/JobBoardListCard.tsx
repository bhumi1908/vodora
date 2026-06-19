"use client";

import { CheckCircle, Clock, MapPin } from "lucide-react";

import type { CandidateJob } from "@/lib/jobs/candidate-jobs.types";

type JobBoardListCardProps = {
  job: CandidateJob;
  selected: boolean;
  applied: boolean;
  onSelect: () => void;
};

export function JobBoardListCard({
  job,
  selected,
  applied,
  onSelect,
}: JobBoardListCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border-2 bg-white p-5 text-left transition-all hover:shadow-md ${
        selected ? "border-blue-500 shadow-md" : "border-gray-200"
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-gray-900">
              {job.title}
            </p>
            {job.urgent ? (
              <span className="shrink-0 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                URGENT
              </span>
            ) : null}
          </div>
          <p className="text-xs text-gray-600">{job.company}</p>
        </div>
        {applied ? (
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
        ) : null}
      </div>

      <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {job.posted}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          {job.type}
        </span>
        <span className="text-xs font-medium text-gray-600">{job.salary}</span>
      </div>
    </button>
  );
}
