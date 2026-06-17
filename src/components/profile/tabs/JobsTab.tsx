import { Briefcase, MapPin } from "lucide-react";

import { staticJobs } from "@/components/profile/static-data";
import { StaticWorkInProgressNotice } from "@/components/profile/StaticWorkInProgressNotice";

export function JobsTab() {
  return (
    <div>
      <StaticWorkInProgressNotice section="Jobs" />

      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Recommended Jobs
      </h2>

      <div className="space-y-4">
        {staticJobs.map((job) => (
          <div
            key={job.id}
            className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/30"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gray-100">
                <Briefcase className="h-6 w-6 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company}</p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {job.type}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                  <span>Posted {job.postedAt}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
