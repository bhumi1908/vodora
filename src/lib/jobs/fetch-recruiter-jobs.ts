import {
  computeHiringFasterPercent,
  computeHoursSavedThisMonth,
  countVerifiedApplicationsThisMonth,
  getCurrentMonthStartIso,
} from "@/lib/jobs/compute-recruiter-hiring-insights";
import {
  transformRecruiterJobPostingRow,
  type RecruiterJobPostingRow,
} from "@/lib/jobs/format-job-posting";
import { computeAvgTimeToHireDays } from "@/lib/jobs/format-recruiter-job-stats";
import type {
  RecruiterDashboardRecentApplicant,
  RecruiterJobDetail,
  RecruiterJobListItem,
  RecruiterJobStats,
  WorkTypeOption,
} from "@/lib/jobs/recruiter-jobs.types";
import { getInitials } from "@/lib/profile/format";
import { fetchRecruiterCandidateProfilesBatch } from "@/lib/recruiter/fetch-recruiter-candidate-profile";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type JobPostingDbRow = Database["public"]["Tables"]["job_postings"]["Row"];
type JobApplicationDbRow = Database["public"]["Tables"]["job_applications"]["Row"];

type DashboardNewApplicationRow = Pick<
  JobApplicationDbRow,
  | "id"
  | "job_posting_id"
  | "candidate_id"
  | "is_new"
  | "applied_at"
  | "references_attached"
  | "included_reference_ids"
>;

type RpcCandidateDetailsRow = {
  candidate_id: string;
  vodora_id: string;
  first_name: string;
  last_name: string;
  email: string;
  title: string | null;
  company: string | null;
};

const RECENT_NEW_APPLICANTS_LIMIT = 2;

const EMPTY_RECRUITER_JOB_STATS: RecruiterJobStats = {
  totalPlacements: 0,
  activeRoles: 0,
  candidatesWorkedWith: 0,
  avgTimeToHireDays: null,
  hiringFasterPercent: null,
  hoursSavedThisMonth: 0,
};

async function fetchProfilesSavedThisMonth(
  supabase: Supabase,
  recruiterId: string,
  monthStartIso: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("recruiter_saved_candidates")
    .select("id", { count: "exact", head: true })
    .eq("recruiter_id", recruiterId)
    .gte("saved_at", monthStartIso);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
export async function fetchRecruiterWorkTypes(
  supabase: Supabase,
): Promise<WorkTypeOption[]> {
  const { data, error } = await supabase
    .from("work_types")
    .select("id, code, name")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function enrichRecruiterJobRows(
  supabase: Supabase,
  rows: JobPostingDbRow[],
): Promise<RecruiterJobPostingRow[]> {
  if (rows.length === 0) {
    return [];
  }

  const jobIds = rows.map((row) => row.id);
  const workTypeIds = [...new Set(rows.map((row) => row.work_type_id))];

  const [{ data: workTypes }, { data: applicationCounts }] = await Promise.all([
    supabase.from("work_types").select("id, name").in("id", workTypeIds),
    supabase.from("job_applications").select("job_posting_id").in("job_posting_id", jobIds),
  ]);

  const workTypeById = new Map(
    (workTypes ?? []).map((workType) => [workType.id, workType.name]),
  );

  const applicantCountByJobId = new Map<string, number>();

  for (const application of applicationCounts ?? []) {
    applicantCountByJobId.set(
      application.job_posting_id,
      (applicantCountByJobId.get(application.job_posting_id) ?? 0) + 1,
    );
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    location: row.location,
    salary_display: row.salary_display,
    is_urgent: row.is_urgent,
    status: row.status,
    published_at: row.published_at,
    created_at: row.created_at,
    work_types: {
      name: workTypeById.get(row.work_type_id) ?? "Full Time",
    },
    job_applications: [{ count: applicantCountByJobId.get(row.id) ?? 0 }],
  }));
}

function parseCandidateDetailsBatch(data: unknown): RpcCandidateDetailsRow[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const row = item as Partial<RpcCandidateDetailsRow>;

    if (
      !row.candidate_id ||
      !row.vodora_id ||
      !row.first_name ||
      !row.last_name ||
      !row.email?.trim()
    ) {
      return [];
    }

    return [row as RpcCandidateDetailsRow];
  });
}

function parseVerifiedReferenceCountsBatch(
  data: unknown,
): Map<string, number> {
  const counts = new Map<string, number>();

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return counts;
  }

  for (const [candidateId, count] of Object.entries(data)) {
    if (typeof count === "number" && Number.isFinite(count)) {
      counts.set(candidateId, count);
    }
  }

  return counts;
}

async function fetchCandidateDetailsBatch(
  supabase: Supabase,
  candidateIds: string[],
): Promise<Map<string, RpcCandidateDetailsRow>> {
  if (candidateIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase.rpc(
    "get_reference_collection_candidate_details_batch",
    {
      p_candidate_ids: candidateIds,
    },
  );

  if (error) {
    return new Map();
  }

  return new Map(
    parseCandidateDetailsBatch(data).map((row) => [row.candidate_id, row]),
  );
}

async function fetchVerifiedReferenceCountsBatch(
  supabase: Supabase,
  candidateIds: string[],
): Promise<Map<string, number>> {
  if (candidateIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase.rpc("count_verified_references_batch", {
    p_candidate_ids: candidateIds,
  });

  if (error) {
    return new Map();
  }

  return parseVerifiedReferenceCountsBatch(data);
}

function computeReferenceCount(
  application: DashboardNewApplicationRow,
  verifiedReferenceCount: number,
): number {
  if (!application.references_attached) {
    return 0;
  }

  if (application.included_reference_ids.length > 0) {
    return application.included_reference_ids.length;
  }

  return verifiedReferenceCount;
}

async function enrichRecruiterJobsWithNewApplicants(
  supabase: Supabase,
  jobs: RecruiterJobListItem[],
): Promise<RecruiterJobListItem[]> {
  if (jobs.length === 0) {
    return jobs;
  }

  const jobIds = jobs.map((job) => job.id);

  const { data: applicationRows, error } = await supabase
    .from("job_applications")
    .select(
      "id, job_posting_id, candidate_id, is_new, applied_at, references_attached, included_reference_ids",
    )
    .in("job_posting_id", jobIds)
    .order("applied_at", { ascending: false });

  if (error) {
    return jobs;
  }

  const applications = applicationRows ?? [];
  const newApplicantCountByJobId = new Map<string, number>();
  const recentNewApplicationsByJobId = new Map<string, DashboardNewApplicationRow[]>();

  for (const application of applications) {
    if (!application.is_new) {
      continue;
    }

    newApplicantCountByJobId.set(
      application.job_posting_id,
      (newApplicantCountByJobId.get(application.job_posting_id) ?? 0) + 1,
    );

    const recentApplications =
      recentNewApplicationsByJobId.get(application.job_posting_id) ?? [];

    if (recentApplications.length < RECENT_NEW_APPLICANTS_LIMIT) {
      recentNewApplicationsByJobId.set(application.job_posting_id, [
        ...recentApplications,
        application,
      ]);
    }
  }

  const recentApplications = [...recentNewApplicationsByJobId.values()].flat();

  if (recentApplications.length === 0) {
    return jobs.map((job) => ({
      ...job,
      newApplicantCount: newApplicantCountByJobId.get(job.id) ?? 0,
    }));
  }

  const candidateIds = [
    ...new Set(recentApplications.map((application) => application.candidate_id)),
  ];
  const referenceCountCandidateIds = recentApplications
    .filter(
      (application) =>
        application.references_attached &&
        application.included_reference_ids.length === 0,
    )
    .map((application) => application.candidate_id);

  const [candidateDetailsById, verifiedReferenceCounts] = await Promise.all([
    fetchCandidateDetailsBatch(supabase, candidateIds),
    fetchVerifiedReferenceCountsBatch(supabase, referenceCountCandidateIds),
  ]);

  const vodoraIds = [...candidateDetailsById.values()].map((row) => row.vodora_id);
  const profilesByVodoraId = await fetchRecruiterCandidateProfilesBatch(
    supabase,
    vodoraIds,
  );

  const recentApplicantsByJobId = new Map<string, RecruiterDashboardRecentApplicant[]>();

  for (const [jobId, jobApplications] of recentNewApplicationsByJobId) {
    const recentApplicants = jobApplications.flatMap((application) => {
      const candidateDetails = candidateDetailsById.get(application.candidate_id);

      if (!candidateDetails) {
        return [];
      }

      const profile = profilesByVodoraId.get(candidateDetails.vodora_id) ?? null;
      const name =
        `${candidateDetails.first_name} ${candidateDetails.last_name}`.trim();

      return [
        {
          applicationId: application.id,
          name,
          avatarInitials:
            profile?.avatarInitials ??
            getInitials(candidateDetails.first_name, candidateDetails.last_name),
          profilePictureUrl: profile?.profilePictureUrl ?? null,
          verifiedReferenceCount: computeReferenceCount(
            application,
            verifiedReferenceCounts.get(application.candidate_id) ?? 0,
          ),
        },
      ];
    });

    recentApplicantsByJobId.set(jobId, recentApplicants);
  }

  return jobs.map((job) => ({
    ...job,
    newApplicantCount: newApplicantCountByJobId.get(job.id) ?? 0,
    recentNewApplicants: recentApplicantsByJobId.get(job.id) ?? [],
  }));
}

export async function fetchRecruiterJobPostings(
  supabase: Supabase,
  recruiterId: string,
) {
  const { data, error } = await supabase
    .from("job_postings")
    .select("*")
    .eq("recruiter_id", recruiterId)
    .in("status", ["published", "draft"])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const enrichedRows = await enrichRecruiterJobRows(supabase, data ?? []);
  const jobs = enrichedRows.map(transformRecruiterJobPostingRow);
  return enrichRecruiterJobsWithNewApplicants(supabase, jobs);
}

export async function fetchRecruiterJobStats(
  supabase: Supabase,
  recruiterId: string,
): Promise<RecruiterJobStats> {
  const monthStartIso = getCurrentMonthStartIso();

  const { data: postings, error: postingsError } = await supabase
    .from("job_postings")
    .select("id, status, published_at, created_at")
    .eq("recruiter_id", recruiterId);

  if (postingsError) {
    throw new Error(postingsError.message);
  }

  const jobPostings = postings ?? [];
  const profilesSavedThisMonth = await fetchProfilesSavedThisMonth(
    supabase,
    recruiterId,
    monthStartIso,
  );

  if (jobPostings.length === 0) {
    return {
      ...EMPTY_RECRUITER_JOB_STATS,
      hoursSavedThisMonth: computeHoursSavedThisMonth({
        verifiedApplicationsThisMonth: 0,
        profilesSavedThisMonth,
      }),
    };
  }

  const activeRoles = jobPostings.filter(
    (posting) => posting.status === "published",
  ).length;

  const jobStartById = new Map(
    jobPostings.map((posting) => [
      posting.id,
      posting.published_at ?? posting.created_at,
    ]),
  );

  const jobIds = jobPostings.map((posting) => posting.id);

  const { data: applications, error: applicationsError } = await supabase
    .from("job_applications")
    .select(
      "candidate_id, status, updated_at, job_posting_id, applied_at, references_attached",
    )
    .in("job_posting_id", jobIds);

  if (applicationsError) {
    throw new Error(applicationsError.message);
  }

  const applicationRows = applications ?? [];
  const placements = applicationRows.filter(
    (application) => application.status === "offer",
  );
  const candidatesWorkedWith = new Set(
    applicationRows.map((application) => application.candidate_id),
  ).size;
  const avgTimeToHireDays = computeAvgTimeToHireDays(placements, jobStartById);
  const verifiedApplicationsThisMonth = countVerifiedApplicationsThisMonth(
    applicationRows,
    monthStartIso,
  );

  return {
    totalPlacements: placements.length,
    activeRoles,
    candidatesWorkedWith,
    avgTimeToHireDays,
    hiringFasterPercent: computeHiringFasterPercent(avgTimeToHireDays),
    hoursSavedThisMonth: computeHoursSavedThisMonth({
      verifiedApplicationsThisMonth,
      profilesSavedThisMonth,
    }),
  };
}
export async function createRecruiterJobPosting(
  supabase: Supabase,
  payload: {
    recruiterId: string;
    companyId: string | null;
    title: string;
    companyDisplayName: string;
    category: string;
    location: string;
    workTypeId: string;
    salaryDisplay: string | null;
    description: string;
    responsibilities: string[];
    requirements: string[];
    isUrgent: boolean;
    status: "draft" | "published";
  },
) {
  const { data, error } = await supabase
    .from("job_postings")
    .insert({
      recruiter_id: payload.recruiterId,
      company_id: payload.companyId,
      title: payload.title,
      company_display_name: payload.companyDisplayName,
      category: payload.category,
      location: payload.location,
      work_type_id: payload.workTypeId,
      salary_display: payload.salaryDisplay,
      description: payload.description,
      responsibilities: payload.responsibilities,
      requirements: payload.requirements,
      is_urgent: payload.isUrgent,
      status: payload.status,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchRecruiterJobPostingById(
  supabase: Supabase,
  recruiterId: string,
  jobId: string,
): Promise<RecruiterJobDetail | null> {
  const { data, error } = await supabase
    .from("job_postings")
    .select(
      "id, title, company_display_name, category, location, work_type_id, salary_display, description, responsibilities, requirements, is_urgent, status",
    )
    .eq("id", jobId)
    .eq("recruiter_id", recruiterId)
    .in("status", ["published", "draft"])
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    companyDisplayName: data.company_display_name,
    category: data.category,
    location: data.location,
    workTypeId: data.work_type_id,
    salaryDisplay: data.salary_display ?? "",
    description: data.description,
    responsibilities: data.responsibilities ?? [],
    requirements: data.requirements ?? [],
    isUrgent: data.is_urgent,
    status: data.status,
  };
}

export async function updateRecruiterJobPosting(
  supabase: Supabase,
  recruiterId: string,
  jobId: string,
  payload: {
    title: string;
    companyDisplayName: string;
    category: string;
    location: string;
    workTypeId: string;
    salaryDisplay: string | null;
    description: string;
    responsibilities: string[];
    requirements: string[];
    isUrgent: boolean;
    status: "draft" | "published";
  },
) {
  const { data: existing, error: existingError } = await supabase
    .from("job_postings")
    .select("id")
    .eq("id", jobId)
    .eq("recruiter_id", recruiterId)
    .in("status", ["published", "draft"])
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (!existing) {
    return null;
  }

  const { data, error } = await supabase
    .from("job_postings")
    .update({
      title: payload.title,
      company_display_name: payload.companyDisplayName,
      category: payload.category,
      location: payload.location,
      work_type_id: payload.workTypeId,
      salary_display: payload.salaryDisplay,
      description: payload.description,
      responsibilities: payload.responsibilities,
      requirements: payload.requirements,
      is_urgent: payload.isUrgent,
      status: payload.status,
    })
    .eq("id", jobId)
    .eq("recruiter_id", recruiterId)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
