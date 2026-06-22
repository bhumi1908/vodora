"use client";

import { useJobApplicationRealtime } from "@/lib/jobs/use-job-application-realtime";

type JobApplicationRealtimeSyncProps = {
  role: "candidate" | "recruiter";
};

export function JobApplicationRealtimeSync({ role }: JobApplicationRealtimeSyncProps) {
  useJobApplicationRealtime(role);
  return null;
}
