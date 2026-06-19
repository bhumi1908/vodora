import type { CandidateJobFilters } from "@/lib/jobs/candidate-jobs.types";
import {
  transformJobPostingRowToCandidateJob,
  type JobPostingRow,
} from "@/lib/jobs/format-job-posting";
import { CANDIDATE_JOBS_PAGE_SIZE } from "@/lib/jobs/job-board-options";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type JobPostingDbRow = Database["public"]["Tables"]["job_postings"]["Row"];

export type PublishedJobsQuery = CandidateJobFilters & {
  page: number;
  limit?: number;
};

export type PublishedJobsResult = {
  jobs: ReturnType<typeof transformJobPostingRowToCandidateJob>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  categoryCounts: Record<string, number>;
};

function applyLocationFilter<T extends { ilike: (column: string, pattern: string) => T }>(
  query: T,
  locationFilter: string,
): T {
  const location = locationFilter.toLowerCase();

  if (location === "all locations") {
    return query;
  }

  if (location === "remote") {
    return query.ilike("location", "%remote%");
  }

  if (location === "australia") {
    return query.ilike("location", "%australia%");
  }

  if (location === "uk") {
    return query.ilike("location", "%uk%");
  }

  if (location === "canada") {
    return query.ilike("location", "%canada%");
  }

  return query;
}

async function fetchWorkTypeIdsByNames(
  supabase: Supabase,
  names: string[],
): Promise<string[]> {
  if (names.length === 0) {
    return [];
  }

  const { data } = await supabase
    .from("work_types")
    .select("id")
    .in("name", names)
    .eq("is_active", true);

  return (data ?? []).map((row) => row.id);
}

async function fetchCategoryCounts(
  supabase: Supabase,
): Promise<Record<string, number>> {
  const { data } = await supabase
    .from("job_postings")
    .select("category")
    .eq("status", "published");

  const counts: Record<string, number> = { All: data?.length ?? 0 };

  for (const row of data ?? []) {
    counts[row.category] = (counts[row.category] ?? 0) + 1;
  }

  return counts;
}

function buildPublishedJobsQuery(
  supabase: Supabase,
  params: PublishedJobsQuery,
  workTypeIds: string[],
) {
  const limit = params.limit ?? CANDIDATE_JOBS_PAGE_SIZE;
  const query = params.query.trim();

  let request = supabase
    .from("job_postings")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (params.category !== "All") {
    request = request.eq("category", params.category);
  }

  if (workTypeIds.length > 0) {
    request = request.in("work_type_id", workTypeIds);
  }

  request = applyLocationFilter(request, params.location);

  if (query) {
    const pattern = `%${query}%`;
    request = request.or(
      `title.ilike.${pattern},company_display_name.ilike.${pattern},category.ilike.${pattern}`,
    );
  }

  const from = (params.page - 1) * limit;
  const to = from + limit - 1;

  return request.range(from, to);
}

async function enrichJobPostingRows(
  supabase: Supabase,
  rows: JobPostingDbRow[],
): Promise<JobPostingRow[]> {
  if (rows.length === 0) {
    return [];
  }

  const workTypeIds = [...new Set(rows.map((row) => row.work_type_id))];
  const recruiterIds = [...new Set(rows.map((row) => row.recruiter_id))];

  const admin = createAdminClient();

  const [{ data: workTypes }, { data: recruiters }] = await Promise.all([
    supabase.from("work_types").select("id, name").in("id", workTypeIds),
    admin
      .from("recruiters")
      .select("id, job_title, profile_picture_url, user_id")
      .in("id", recruiterIds),
  ]);

  const workTypeById = new Map(
    (workTypes ?? []).map((workType) => [workType.id, workType.name]),
  );

  const recruiterById = new Map((recruiters ?? []).map((recruiter) => [recruiter.id, recruiter]));
  const userIds = [...new Set((recruiters ?? []).map((recruiter) => recruiter.user_id))];

  const { data: users } = await admin
    .from("users")
    .select("id, first_name, last_name, email_verified_at")
    .in("id", userIds);

  const userById = new Map((users ?? []).map((user) => [user.id, user]));

  return rows.map((row) => {
    const recruiter = recruiterById.get(row.recruiter_id);
    const user = recruiter ? userById.get(recruiter.user_id) ?? null : null;

    return {
      id: row.id,
      title: row.title,
      company_display_name: row.company_display_name,
      category: row.category,
      location: row.location,
      salary_display: row.salary_display,
      description: row.description,
      responsibilities: row.responsibilities,
      requirements: row.requirements,
      is_urgent: row.is_urgent,
      published_at: row.published_at,
      created_at: row.created_at,
      status: row.status,
      work_types: {
        name: workTypeById.get(row.work_type_id) ?? "Full Time",
      },
      recruiters: recruiter
        ? {
            job_title: recruiter.job_title,
            profile_picture_url: recruiter.profile_picture_url,
            users: user
              ? {
                  first_name: user.first_name,
                  last_name: user.last_name,
                  email_verified_at: user.email_verified_at,
                }
              : null,
          }
        : null,
    };
  });
}

export async function fetchPublishedJobs(
  supabase: Supabase,
  params: PublishedJobsQuery,
): Promise<PublishedJobsResult> {
  const limit = params.limit ?? CANDIDATE_JOBS_PAGE_SIZE;
  const workTypeIds = await fetchWorkTypeIdsByNames(supabase, params.workTypes);

  if (params.workTypes.length > 0 && workTypeIds.length === 0) {
    const categoryCounts = await fetchCategoryCounts(supabase);

    return {
      jobs: [],
      total: 0,
      page: params.page,
      limit,
      totalPages: 0,
      categoryCounts,
    };
  }

  const [{ data, count, error }, categoryCounts] = await Promise.all([
    buildPublishedJobsQuery(supabase, params, workTypeIds),
    fetchCategoryCounts(supabase),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
  const enrichedRows = await enrichJobPostingRows(supabase, data ?? []);
  const jobs = enrichedRows.map(transformJobPostingRowToCandidateJob);

  return {
    jobs,
    total,
    page: params.page,
    limit,
    totalPages,
    categoryCounts,
  };
}

export async function fetchPublishedJobById(
  supabase: Supabase,
  jobId: string,
) {
  const { data, error } = await supabase
    .from("job_postings")
    .select("*")
    .eq("id", jobId)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const [row] = await enrichJobPostingRows(supabase, [data]);
  return transformJobPostingRowToCandidateJob(row);
}
