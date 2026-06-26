import type {
  ConnectionStatus,
  ProfileConnectionState,
} from "@/lib/connections/connection.types";
import { formatLocation, getInitials } from "@/lib/profile/format";
import type { CandidateRecruiterProfileData } from "@/lib/recruiter/candidate-recruiter-profile.types";
import type { RecruiterDirectoryActiveRole } from "@/lib/recruiter/recruiter-directory.types";

type RpcActiveRoleRow = {
  id?: string;
  title?: string;
  type?: string;
  location?: string;
  salary?: string;
};

type RpcConnectionRow = {
  id?: string;
  status?: string;
  initiated_by?: string;
  connection_type?: string;
  viewer_is_initiator?: boolean;
};

type RpcStatsRow = {
  total_placements?: number;
  active_roles?: number;
  candidates_worked_with?: number;
  avg_time_to_hire_days?: number | null;
};

type RpcUserRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  email_verified_at: string | null;
};

type RpcRecruiterRow = {
  id: string;
  job_title: string | null;
  bio: string | null;
  recruiter_type: string | null;
  specialisations: string[] | null;
  industries: string[] | null;
  preferred_work_type_codes: string[] | null;
  preferred_experience_levels: string[] | null;
  remote_preference: string | null;
  profile_picture_url: string | null;
};

type RpcCompanyRow = {
  id: string;
  name: string;
  website: string | null;
  city: string | null;
  country: string | null;
  is_verified: boolean;
};

export type CandidateRecruiterProfileRpcResult = {
  user: RpcUserRow;
  recruiter: RpcRecruiterRow;
  company: RpcCompanyRow | null;
  display_company_name: string;
  location: string;
  verified: boolean;
  stats: RpcStatsRow;
  active_roles: RpcActiveRoleRow[] | null;
  connection: RpcConnectionRow | null;
};

function normalizeConnectionStatus(
  value: string | null | undefined,
): ConnectionStatus | null {
  if (value === "connected" || value === "pending") {
    return value;
  }

  return null;
}

function normalizeConnection(
  connection: RpcConnectionRow | null | undefined,
): ProfileConnectionState {
  if (!connection?.id || !connection.status) {
    return null;
  }

  return {
    id: connection.id,
    status: connection.status === "connected" ? "connected" : "pending",
    initiatedBy: connection.viewer_is_initiator ? "candidate" : "recruiter",
    connectionType: "candidate_recruiter",
  };
}

function normalizeActiveRoles(
  roles: RpcActiveRoleRow[] | null | undefined,
): RecruiterDirectoryActiveRole[] {
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

export function normalizeCandidateRecruiterProfileRpcResult(
  data: unknown,
): CandidateRecruiterProfileRpcResult | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;
  const user = record.user;
  const recruiter = record.recruiter;

  if (!user || typeof user !== "object" || !recruiter || typeof recruiter !== "object") {
    return null;
  }

  const companyRaw = record.company;

  return {
    user: user as RpcUserRow,
    recruiter: {
      ...(recruiter as RpcRecruiterRow),
      specialisations: (recruiter as RpcRecruiterRow).specialisations ?? [],
      industries: (recruiter as RpcRecruiterRow).industries ?? [],
      preferred_work_type_codes:
        (recruiter as RpcRecruiterRow).preferred_work_type_codes ?? [],
      preferred_experience_levels:
        (recruiter as RpcRecruiterRow).preferred_experience_levels ?? [],
    },
    company:
      companyRaw && typeof companyRaw === "object"
        ? (companyRaw as RpcCompanyRow)
        : null,
    display_company_name:
      typeof record.display_company_name === "string"
        ? record.display_company_name
        : "Independent",
    location:
      typeof record.location === "string"
        ? record.location
        : "Location not listed",
    verified: Boolean(record.verified),
    stats:
      record.stats && typeof record.stats === "object"
        ? (record.stats as RpcStatsRow)
        : {},
    active_roles: Array.isArray(record.active_roles)
      ? (record.active_roles as RpcActiveRoleRow[])
      : [],
    connection:
      record.connection && typeof record.connection === "object"
        ? (record.connection as RpcConnectionRow)
        : null,
  };
}

export function transformCandidateRecruiterProfileToView(
  raw: CandidateRecruiterProfileRpcResult,
): CandidateRecruiterProfileData {
  const { user, recruiter, company, display_company_name, location, verified, stats } =
    raw;

  const formattedLocation =
    formatLocation(user.city ?? company?.city, user.country ?? company?.country) ??
    location;

  return {
    userId: user.id,
    recruiterId: recruiter.id,
    name: `${user.first_name} ${user.last_name}`.trim() || "Recruiter",
    title: recruiter.job_title?.trim() || "Recruiter",
    company: display_company_name?.trim() || company?.name?.trim() || "Independent",
    location: formattedLocation,
    email: user.email,
    phone: user.phone,
    website: company?.website ?? null,
    avatarInitials: getInitials(user.first_name, user.last_name),
    profilePictureUrl: recruiter.profile_picture_url,
    bio: recruiter.bio,
    specialisations: recruiter.specialisations ?? [],
    industries: recruiter.industries ?? [],
    verified: verified || Boolean(company?.is_verified) || Boolean(user.email_verified_at),
    hiringPreferences: {
      preferredWorkTypeCodes: recruiter.preferred_work_type_codes ?? [],
      preferredExperienceLevels: recruiter.preferred_experience_levels ?? [],
      remotePreference: recruiter.remote_preference,
    },
    stats: {
      totalPlacements: stats.total_placements ?? 0,
      activeRoles: stats.active_roles ?? 0,
      candidatesWorkedWith: stats.candidates_worked_with ?? 0,
      avgTimeToHireDays: stats.avg_time_to_hire_days ?? null,
    },
    activeRoles: normalizeActiveRoles(raw.active_roles),
    connectionStatus: normalizeConnectionStatus(raw.connection?.status),
    connection: normalizeConnection(raw.connection),
  };
}
