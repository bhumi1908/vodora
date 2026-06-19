import {
  formatLocation,
  getInitials,
} from "@/lib/profile/format";
import type { OwnRecruiterProfileRpcResult } from "@/lib/recruiter/own-recruiter-profile-rpc.types";
import type { RecruiterProfileData } from "@/lib/recruiter/recruiter-profile.types";

export function normalizeOwnRecruiterProfileRpcResult(
  data: unknown,
): OwnRecruiterProfileRpcResult | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;
  const user = record.user;

  if (!user || typeof user !== "object") {
    return null;
  }

  const recruiterRaw = record.recruiter as
    | OwnRecruiterProfileRpcResult["recruiter"]
    | null
    | undefined;
  const companyRaw = record.company as
    | OwnRecruiterProfileRpcResult["company"]
    | null
    | undefined;

  return {
    user: user as OwnRecruiterProfileRpcResult["user"],
    recruiter: recruiterRaw
      ? {
          ...recruiterRaw,
          specialisations: recruiterRaw.specialisations ?? [],
          industries: recruiterRaw.industries ?? [],
          preferred_work_type_codes:
            recruiterRaw.preferred_work_type_codes ?? [],
          preferred_experience_levels:
            recruiterRaw.preferred_experience_levels ?? [],
          remote_preference: recruiterRaw.remote_preference ?? null,
          profile_picture_url: recruiterRaw.profile_picture_url ?? null,
        }
      : null,
    company: companyRaw
      ? {
          ...companyRaw,
          employee_count_range: companyRaw.employee_count_range ?? null,
          hires_per_year_range: companyRaw.hires_per_year_range ?? null,
        }
      : null,
  };
}

export function transformOwnRecruiterProfileToView(
  raw: OwnRecruiterProfileRpcResult,
): RecruiterProfileData | null {
  const { user, recruiter, company } = raw;

  if (!user) {
    return null;
  }

  const location =
    formatLocation(user.city ?? company?.city, user.country ?? company?.country) ??
    null;

  return {
    userId: user.id,
    recruiterId: recruiter?.id ?? null,
    name: `${user.first_name} ${user.last_name}`.trim(),
    title: recruiter?.job_title ?? null,
    company: company?.name ?? null,
    location,
    email: user.email,
    phone: user.phone,
    website: company?.website ?? null,
    avatarInitials: getInitials(user.first_name, user.last_name),
    profilePictureUrl: recruiter?.profile_picture_url ?? null,
    bio: recruiter?.bio ?? null,
    specialisations: recruiter?.specialisations ?? [],
    industries: recruiter?.industries ?? [],
    verified: company?.is_verified ?? Boolean(user.email_verified_at),
  };
}
