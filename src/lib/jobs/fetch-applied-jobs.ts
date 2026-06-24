import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchJobPostingsByIds } from "@/lib/jobs/fetch-published-jobs";
import { formatRelativePosted } from "@/lib/jobs/format-job-posting";
import type { CandidateAppliedJob } from "@/lib/jobs/job-application.types";
import { mapApplicationStatus } from "@/lib/jobs/map-application-status";
import { requireOwnCandidate } from "@/lib/profile/require-own-candidate";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function fetchAppliedJobs(
  supabase: Supabase,
): Promise<{ applications: CandidateAppliedJob[]; error: string | null }> {
  const candidateContext = await requireOwnCandidate(supabase);

  if (!candidateContext) {
    return { applications: [], error: "Authentication required." };
  }

  const { data: applicationRows, error } = await supabase
    .from("job_applications")
    .select("id, job_posting_id, status, applied_at, references_attached")
    .eq("candidate_id", candidateContext.candidateId)
    .order("applied_at", { ascending: false });

  if (error) {
    return { applications: [], error: error.message };
  }

  const rows = applicationRows ?? [];

  if (rows.length === 0) {
    return { applications: [], error: null };
  }

  const jobIds = [...new Set(rows.map((row) => row.job_posting_id))];
  const jobs = await fetchJobPostingsByIds(supabase, jobIds);
  const jobById = new Map(jobs.map((job) => [job.id, job]));

  const applications: CandidateAppliedJob[] = [];

  for (const row of rows) {
    const job = jobById.get(row.job_posting_id);

    if (!job) {
      continue;
    }

    applications.push({
      applicationId: row.id,
      job,
      status: mapApplicationStatus(row.status),
      appliedAt: formatRelativePosted(row.applied_at),
      referencesAttached: row.references_attached,
    });
  }

  return { applications, error: null };
}
