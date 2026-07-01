import { getInitials } from "@/lib/profile/format";
import type { CandidateJob, JobRecruiter } from "@/lib/jobs/candidate-jobs.types";
import type { RecruiterJobListItem } from "@/lib/jobs/recruiter-jobs.types";

type WorkTypeJoin = { name: string } | null;

type UserJoin = {
  first_name: string;
  last_name: string;
  email_verified_at: string | null;
} | null;

type RecruiterJoin = {
  job_title: string | null;
  profile_picture_url: string | null;
  users: UserJoin;
} | null;

export type JobPostingRow = {
  id: string;
  title: string;
  company_display_name: string;
  category: string;
  location: string;
  salary_display: string | null;
  description: string;
  responsibilities: string[];
  requirements: string[];
  is_urgent: boolean;
  published_at: string | null;
  created_at: string;
  status: string;
  work_types: WorkTypeJoin;
  recruiters: RecruiterJoin;
};

export type RecruiterJobPostingRow = {
  id: string;
  title: string;
  location: string;
  salary_display: string | null;
  is_urgent: boolean;
  status: string;
  published_at: string | null;
  created_at: string;
  work_types: WorkTypeJoin;
  job_applications: Array<{ count: number }> | null;
};

export function formatRelativePosted(
  publishedAt: string | null,
  createdAt?: string | null,
): string {
  const dateSource = publishedAt ?? createdAt;

  if (!dateSource) {
    return "Recently";
  }

  const date = new Date(dateSource);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "1 day ago";
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);

  if (diffWeeks === 1) {
    return "1 week ago";
  }

  if (diffWeeks < 5) {
    return `${diffWeeks} weeks ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths <= 1) {
    return "1 month ago";
  }

  return `${diffMonths} months ago`;
}

function formatPostedDate(publishedAt: string | null, createdAt?: string | null): string {
  const dateSource = publishedAt ?? createdAt;

  if (!dateSource) {
    return "";
  }

  const date = new Date(dateSource);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function transformRecruiterInfo(recruiter: RecruiterJoin): JobRecruiter {
  const user = recruiter?.users;
  const firstName = user?.first_name?.trim() ?? "";
  const lastName = user?.last_name?.trim() ?? "";
  const name = `${firstName} ${lastName}`.trim() || "Hiring team";

  return {
    name,
    title: recruiter?.job_title?.trim() ?? "",
    company: "",
    avatar: getInitials(firstName || "H", lastName || "T"),
    profilePictureUrl: recruiter?.profile_picture_url ?? null,
    verified: Boolean(user?.email_verified_at),
  };
}

export function transformJobPostingRowToCandidateJob(row: JobPostingRow): CandidateJob {
  const recruiter = transformRecruiterInfo(row.recruiters);

  return {
    id: row.id,
    title: row.title,
    company: row.company_display_name,
    category: row.category,
    location: row.location,
    type: row.work_types?.name ?? "Full Time",
    salary: row.salary_display?.trim() || "Competitive",
    posted: formatRelativePosted(row.published_at, row.created_at),
    postedDate: formatPostedDate(row.published_at, row.created_at),
    urgent: row.is_urgent,
    description: row.description,
    responsibilities: row.responsibilities ?? [],
    requirements: row.requirements ?? [],
    recruiter: {
      ...recruiter,
      company: row.company_display_name,
    },
  };
}

export function transformRecruiterJobPostingRow(
  row: RecruiterJobPostingRow,
): RecruiterJobListItem {
  const applicantCount = row.job_applications?.[0]?.count ?? 0;

  return {
    id: row.id,
    title: row.title,
    type: row.work_types?.name ?? "Full Time",
    location: row.location,
    salary: row.salary_display?.trim() || "Competitive",
    applicants: applicantCount,
    posted: formatRelativePosted(row.published_at, row.created_at),
    urgent: row.is_urgent,
    status: row.status,
    newApplicantCount: 0,
    recentNewApplicants: [],
  };
}

export function parseTextList(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}
