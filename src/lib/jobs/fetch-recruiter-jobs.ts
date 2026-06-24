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
  RecruiterJobDetail,
  RecruiterJobStats,
  WorkTypeOption,
} from "@/lib/jobs/recruiter-jobs.types";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type JobPostingDbRow = Database["public"]["Tables"]["job_postings"]["Row"];

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
  return enrichedRows.map(transformRecruiterJobPostingRow);
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
