import type { SupabaseClient } from "@supabase/supabase-js";

import type { ConnectionStatus } from "@/lib/connections/connection.types";
import { RECRUITER_DIRECTORY_PAGE_SIZE } from "@/lib/recruiter/recruiter-directory-options";
import type {
  RecruiterDirectoryEntry,
  RecruiterDirectorySearchParams,
  RecruiterDirectorySearchResult,
} from "@/lib/recruiter/recruiter-directory.types";
import { getInitials } from "@/lib/profile/format";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type RpcActiveRoleRow = {
  id?: string;
  title?: string;
  type?: string;
  location?: string;
  salary?: string;
};

type RpcRecruiterRow = {
  id: string;
  user_id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  profile_picture_url: string | null;
  verified: boolean;
  specialisations: string[] | null;
  industries: string[] | null;
  recruiter_type: string | null;
  bio: string | null;
  placements: number;
  avg_hire_days: number | null;
  active_roles: RpcActiveRoleRow[] | null;
  connection_status: string | null;
};

type RpcSearchResponse = {
  total_count?: number;
  recruiters?: RpcRecruiterRow[];
};

const MAX_LIMIT = 50;

function formatAvgHire(days: number | null): string {
  if (days === null || Number.isNaN(days)) {
    return "—";
  }

  return `${days} day${days === 1 ? "" : "s"}`;
}

function getAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "R";
  }

  if (parts.length === 1) {
    return getInitials(parts[0], "");
  }

  return getInitials(parts[0] ?? "R", parts[parts.length - 1] ?? "C");
}

function normalizeConnectionStatus(
  value: string | null | undefined,
): ConnectionStatus | null {
  if (value === "connected" || value === "pending") {
    return value;
  }

  return null;
}

function normalizeActiveRoles(
  roles: RpcActiveRoleRow[] | null | undefined,
): RecruiterDirectoryEntry["activeRoles"] {
  if (!Array.isArray(roles)) {
    return [];
  }

  return roles
    .filter((role): role is RpcActiveRoleRow & { id: string; title: string } =>
      Boolean(role && typeof role === "object" && role.id && role.title),
    )
    .map((role) => ({
      id: role.id,
      title: role.title,
      type: role.type?.trim() || "Full Time",
      location: role.location?.trim() || "Location not listed",
      salary: role.salary?.trim() || "Competitive",
    }));
}

function normalizeRecruiter(row: RpcRecruiterRow): RecruiterDirectoryEntry {
  const name = row.name.trim() || "Recruiter";

  return {
    id: row.id,
    userId: row.user_id,
    name,
    title: row.title?.trim() || "Recruiter",
    company: row.company?.trim() || "Independent",
    location: row.location?.trim() || "Location not listed",
    avatar: getAvatarInitials(name),
    profilePictureUrl: row.profile_picture_url,
    placements: row.placements ?? 0,
    avgHire: formatAvgHire(row.avg_hire_days),
    verified: Boolean(row.verified),
    specialisations: row.specialisations ?? [],
    industries: row.industries ?? [],
    recruiterType: row.recruiter_type,
    bio: row.bio,
    activeRoles: normalizeActiveRoles(row.active_roles),
    connectionStatus: normalizeConnectionStatus(row.connection_status),
  };
}

export async function searchRecruitersForCandidates(
  supabase: Supabase,
  params: RecruiterDirectorySearchParams,
): Promise<RecruiterDirectorySearchResult> {
  const limit = Math.min(
    Math.max(params.limit ?? RECRUITER_DIRECTORY_PAGE_SIZE, 1),
    MAX_LIMIT,
  );
  const page = Math.max(params.page ?? 1, 1);
  const offset = (page - 1) * limit;
  const specialisation = params.specialisation?.trim();
  const isAllSpecialisation =
    !specialisation || specialisation === "All";

  const { data, error } = await supabase.rpc("search_recruiters_for_candidates", {
    p_query: params.query?.trim() || undefined,
    p_category: isAllSpecialisation ? undefined : specialisation,
    p_offset: offset,
    p_limit: limit,
  });

  if (error) {
    return {
      recruiters: [],
      totalCount: 0,
      page,
      limit,
      totalPages: 0,
      error: error.message,
    };
  }

  const payload =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as RpcSearchResponse)
      : null;

  const totalCount = payload?.total_count ?? 0;
  const rows = Array.isArray(payload?.recruiters) ? payload.recruiters : [];

  return {
    recruiters: rows
      .filter(
        (row): row is RpcRecruiterRow =>
          Boolean(row && typeof row === "object" && "id" in row && "user_id" in row),
      )
      .map(normalizeRecruiter),
    totalCount,
    page,
    limit,
    totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 0,
    error: null,
  };
}
