import type { CandidateProfileEditData } from "@/components/profile/edit/types";
import {
  formatDateRange,
  formatLocation,
  getInitials,
} from "@/lib/profile/format";
import type { OwnCandidateProfileRpcResult } from "@/lib/profile/own-candidate-profile-rpc.types";
import { parseSpotlightBlocks } from "@/lib/profile/spotlight";
import { resolveProfilePictureUrl } from "@/lib/profile/resolve-profile-picture-url";
import type { CandidateProfileData } from "@/lib/profile/types";

function toMonthInput(value: string | null): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 7);
}

function normalizeRpcResult(
  data: unknown,
): OwnCandidateProfileRpcResult | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;
  const user = record.user;

  if (!user || typeof user !== "object") {
    return null;
  }

  return {
    user: user as OwnCandidateProfileRpcResult["user"],
    candidate: (record.candidate as OwnCandidateProfileRpcResult["candidate"]) ?? null,
    skills: (record.skills as OwnCandidateProfileRpcResult["skills"]) ?? [],
    employment:
      (record.employment as OwnCandidateProfileRpcResult["employment"]) ?? [],
    education:
      (record.education as OwnCandidateProfileRpcResult["education"]) ?? [],
    documents:
      (record.documents as OwnCandidateProfileRpcResult["documents"]) ?? [],
  };
}

export function transformOwnCandidateProfileToView(
  raw: OwnCandidateProfileRpcResult,
): CandidateProfileData | null {
  const { user, candidate, skills, employment, education, documents } = raw;

  if (!user) {
    return null;
  }

  const baseProfile: CandidateProfileData = {
    userId: user.id,
    candidateId: candidate?.id ?? null,
    name: `${user.first_name} ${user.last_name}`.trim(),
    title:
      candidate?.current_position ??
      candidate?.headline ??
      candidate?.profession ??
      null,
    company: candidate?.current_company_name ?? null,
    location:
      formatLocation(candidate?.city ?? user.city, candidate?.country ?? user.country) ??
      null,
    email: user.email,
    phone: user.phone,
    website: candidate?.linkedin_profile_url ?? null,
    avatarInitials: getInitials(user.first_name, user.last_name),
    profilePictureUrl: resolveProfilePictureUrl(
      candidate?.profile_picture_url,
      documents,
    ),
    about: candidate?.summary ?? null,
    profession: candidate?.profession ?? null,
    vodoraId: candidate?.vodora_id ?? null,
    availabilityStatus: candidate?.availability_status ?? "not_looking",
    availabilityStart: candidate?.availability_start ?? null,
    spotlightBlocks: parseSpotlightBlocks(candidate?.spotlight_blocks ?? []),
    skills: [],
    experience: [],
    education: [],
    documents: [],
  };

  if (!candidate) {
    return baseProfile;
  }

  return {
    ...baseProfile,
    skills: skills.map((skill) => ({
      id: skill.id,
      name: skill.skill_name,
      proficiency: skill.proficiency,
      yearsExperience: skill.years_experience,
    })),
    experience: employment.map((entry) => ({
      id: entry.id,
      title: entry.job_title,
      company: entry.company_name,
      period: formatDateRange(
        entry.start_date,
        entry.end_date,
        entry.is_current,
      ),
      description: entry.description,
      location: entry.location,
    })),
    education: education.map((entry) => ({
      id: entry.id,
      degree: entry.degree_or_class,
      school: entry.institution_name,
      period: formatDateRange(entry.start_date, entry.end_date),
      description: entry.description,
    })),
    documents: documents.map((document) => ({
      id: document.id,
      name: document.file_name,
      type: document.document_type,
      url: document.file_url,
      uploadedAt: document.uploaded_at,
      isPrimary: document.is_primary,
    })),
  };
}

export function transformOwnCandidateProfileToEdit(
  raw: OwnCandidateProfileRpcResult,
): CandidateProfileEditData | null {
  const { user, candidate, skills, employment, education, documents } = raw;

  if (!user || !candidate) {
    return null;
  }

  return {
    userId: user.id,
    candidateId: candidate.id,
    name: `${user.first_name} ${user.last_name}`.trim(),
    avatarInitials: getInitials(user.first_name, user.last_name),
    profilePictureUrl: resolveProfilePictureUrl(
      candidate.profile_picture_url,
      documents,
    ),
    title: candidate.current_position ?? candidate.headline ?? "",
    jobTitleId: candidate.job_title_id ?? "",
    company: candidate.current_company_name ?? "",
    phone: user.phone ?? "",
    website: candidate.linkedin_profile_url ?? "",
    city: candidate.city ?? user.city ?? "",
    country: candidate.country ?? user.country ?? "",
    about: candidate.summary ?? "",
    availabilityStatus: candidate.availability_status ?? "not_looking",
    availabilityStart:
      candidate.availability_status === "not_looking"
        ? ""
        : (candidate.availability_start ?? ""),
    totalYearsExperience:
      candidate.total_years_experience !== null &&
      candidate.total_years_experience !== undefined
        ? String(candidate.total_years_experience)
        : "",
    experienceLevel: candidate.experience_level ?? "",
    experience: employment.map((entry) => ({
      id: entry.id,
      title: entry.job_title,
      company: entry.company_name,
      location: entry.location ?? "",
      startDate: toMonthInput(entry.start_date),
      endDate: toMonthInput(entry.end_date),
      isCurrent: entry.is_current,
      description: entry.description ?? "",
    })),
    education: education.map((entry) => ({
      id: entry.id,
      degree: entry.degree_or_class,
      school: entry.institution_name,
      startDate: toMonthInput(entry.start_date),
      endDate: toMonthInput(entry.end_date),
      description: entry.description ?? "",
    })),
    skills: skills.map((skill) => ({
      id: skill.id,
      name: skill.skill_name,
      proficiency: skill.proficiency ?? "",
      yearsExperience:
        skill.years_experience !== null ? String(skill.years_experience) : "",
    })),
    documents: documents.map((document) => ({
      id: document.id,
      name: document.file_name,
      type: document.document_type,
      url: document.file_url,
      uploadedAt: document.uploaded_at,
      isPrimary: document.is_primary,
    })),
  };
}

export { normalizeRpcResult };
