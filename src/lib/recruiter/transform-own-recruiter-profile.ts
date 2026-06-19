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

  return {
    user: user as OwnRecruiterProfileRpcResult["user"],
    recruiter:
      (record.recruiter as OwnRecruiterProfileRpcResult["recruiter"]) ?? null,
    company:
      (record.company as OwnRecruiterProfileRpcResult["company"]) ?? null,
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
    bio: recruiter?.bio ?? null,
    verified: company?.is_verified ?? Boolean(user.email_verified_at),
  };
}
