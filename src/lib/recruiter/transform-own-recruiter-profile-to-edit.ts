import type { OwnRecruiterProfileRpcResult } from "@/lib/recruiter/own-recruiter-profile-rpc.types";
import { getInitials } from "@/lib/profile/format";

export type RecruiterProfileEditData = {
  name: string;
  avatarInitials: string;
  profilePictureUrl: string | null;
  email: string;  title: string;
  phone: string;
  city: string;
  country: string;
  companyName: string;
  website: string;
  employeeCount: string;
  hiresPerYear: string;
  recruiterType: string;
  bio: string;
  specialisations: string[];
  industries: string[];
  preferredWorkTypeCodes: string[];
  preferredExperienceLevels: string[];
  remotePreference: string;
};

export function transformOwnRecruiterProfileToEdit(
  raw: OwnRecruiterProfileRpcResult,
): RecruiterProfileEditData | null {
  const { user, recruiter, company } = raw;

  if (!user) {
    return null;
  }

  return {
    name: `${user.first_name} ${user.last_name}`.trim(),
    avatarInitials: getInitials(user.first_name, user.last_name),
    profilePictureUrl: recruiter?.profile_picture_url ?? null,
    email: user.email,
    title: recruiter?.job_title ?? "",
    phone: user.phone ?? "",
    city: user.city ?? company?.city ?? "",
    country: user.country ?? company?.country ?? "",
    companyName: company?.name ?? "",
    website: company?.website ?? "",
    employeeCount: company?.employee_count_range ?? "",
    hiresPerYear: company?.hires_per_year_range ?? "",
    recruiterType: recruiter?.recruiter_type ?? "",
    bio: recruiter?.bio ?? "",
    specialisations: recruiter?.specialisations ?? [],
    industries: recruiter?.industries ?? [],
    preferredWorkTypeCodes: recruiter?.preferred_work_type_codes ?? [],
    preferredExperienceLevels: recruiter?.preferred_experience_levels ?? [],
    remotePreference: recruiter?.remote_preference ?? "",
  };
}

export function updateRecruiterProfilePhoto(
  data: RecruiterProfileEditData,
  profilePictureUrl: string,
): RecruiterProfileEditData {
  return {
    ...data,
    profilePictureUrl,
  };
}

export function cloneRecruiterProfileEditData(
  data: RecruiterProfileEditData,
): RecruiterProfileEditData {
  return {
    ...data,
    specialisations: [...data.specialisations],
    industries: [...data.industries],
    preferredWorkTypeCodes: [...data.preferredWorkTypeCodes],
    preferredExperienceLevels: [...data.preferredExperienceLevels],
  };
}

export type RecruiterDetailsFields = Pick<
  RecruiterProfileEditData,
  "title" | "phone" | "city" | "country"
>;

export type RecruiterCompanyFields = Pick<
  RecruiterProfileEditData,
  | "companyName"
  | "website"
  | "city"
  | "country"
  | "employeeCount"
  | "hiresPerYear"
  | "recruiterType"
>;

export type RecruiterAboutFields = Pick<
  RecruiterProfileEditData,
  "bio" | "specialisations" | "industries"
>;

export type RecruiterHiringPreferencesFields = Pick<
  RecruiterProfileEditData,
  "preferredWorkTypeCodes" | "preferredExperienceLevels" | "remotePreference"
>;

export function isRecruiterDetailsDirty(
  saved: RecruiterDetailsFields,
  current: RecruiterDetailsFields,
): boolean {
  return (
    saved.title !== current.title ||
    saved.phone !== current.phone ||
    saved.city !== current.city ||
    saved.country !== current.country
  );
}

export function isRecruiterCompanyDirty(
  saved: RecruiterCompanyFields,
  current: RecruiterCompanyFields,
): boolean {
  return (
    saved.companyName !== current.companyName ||
    saved.website !== current.website ||
    saved.city !== current.city ||
    saved.country !== current.country ||
    saved.employeeCount !== current.employeeCount ||
    saved.hiresPerYear !== current.hiresPerYear ||
    saved.recruiterType !== current.recruiterType
  );
}

export function isRecruiterAboutDirty(
  saved: RecruiterAboutFields,
  current: RecruiterAboutFields,
): boolean {
  if (saved.bio !== current.bio) {
    return true;
  }

  if (saved.specialisations.length !== current.specialisations.length) {
    return true;
  }

  if (saved.industries.length !== current.industries.length) {
    return true;
  }

  const savedSpecialisations = [...saved.specialisations].sort().join("|");
  const currentSpecialisations = [...current.specialisations].sort().join("|");

  if (savedSpecialisations !== currentSpecialisations) {
    return true;
  }

  const savedIndustries = [...saved.industries].sort().join("|");
  const currentIndustries = [...current.industries].sort().join("|");

  return savedIndustries !== currentIndustries;
}

function sortedArrayKey(values: string[]): string {
  return [...values].sort().join("|");
}

export function isRecruiterHiringPreferencesDirty(
  saved: RecruiterHiringPreferencesFields,
  current: RecruiterHiringPreferencesFields,
): boolean {
  return (
    saved.remotePreference !== current.remotePreference ||
    sortedArrayKey(saved.preferredWorkTypeCodes) !==
      sortedArrayKey(current.preferredWorkTypeCodes) ||
    sortedArrayKey(saved.preferredExperienceLevels) !==
      sortedArrayKey(current.preferredExperienceLevels)
  );
}

export function isRecruiterCompanyProfileComplete(
  profile: Pick<
    RecruiterProfileEditData,
    | "companyName"
    | "website"
    | "city"
    | "country"
    | "employeeCount"
    | "hiresPerYear"
    | "recruiterType"
  >,
): boolean {
  return (
    profile.companyName.trim().length > 0 &&
    profile.website.trim().length > 0 &&
    profile.city.trim().length > 0 &&
    profile.country.trim().length > 0 &&
    profile.employeeCount.trim().length > 0 &&
    profile.hiresPerYear.trim().length > 0 &&
    profile.recruiterType.trim().length > 0
  );
}

export function isRecruiterHiringPreferencesComplete(
  profile: RecruiterHiringPreferencesFields,
): boolean {
  return (
    profile.preferredWorkTypeCodes.length > 0 ||
    profile.preferredExperienceLevels.length > 0 ||
    profile.remotePreference.trim().length > 0
  );
}
