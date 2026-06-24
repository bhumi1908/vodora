import { CheckCircle } from "lucide-react";

import { JOB_APPLICATION_STATUS_STYLES } from "@/lib/jobs/candidate-jobs-static-data";
import type { JobApplicationStatus } from "@/lib/jobs/candidate-jobs.types";

type ApplicationStatusBadgeProps = {
  status: JobApplicationStatus;
  compact?: boolean;
};

export function ApplicationStatusBadge({
  status,
  compact = false,
}: ApplicationStatusBadgeProps) {
  const statusStyle =
    JOB_APPLICATION_STATUS_STYLES[status] ??
    JOB_APPLICATION_STATUS_STYLES.Applied;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${statusStyle} ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      }`}
    >
      {status === "Applied" ? (
        <CheckCircle className="mr-1 h-3 w-3 shrink-0" />
      ) : null}
      {status}
    </span>
  );
}
