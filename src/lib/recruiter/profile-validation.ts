import {
  EMPLOYEE_COUNT_VALUES,
  HIRES_PER_YEAR_VALUES,
  RECRUITER_TYPE_VALUES,
  WORK_TYPE_CODES,
} from "@/lib/auth/constants";
import {
  HIRING_EXPERIENCE_LEVEL_VALUES,
  REMOTE_PREFERENCE_VALUES,
} from "@/lib/recruiter/hiring-preferences";
import type { FieldErrors } from "@/lib/form/field-errors";
import {
  RECRUITER_INDUSTRY_OPTIONS,
  RECRUITER_SPECIALISATION_OPTIONS,
} from "@/lib/recruiter/recruiter-profile-options";
import type {
  RecruiterAboutFields,
  RecruiterCompanyFields,
  RecruiterDetailsFields,
  RecruiterHiringPreferencesFields,
} from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";

const PHONE_PATTERN = /^[+]?[\d\s().-]{7,30}$/;
const WEBSITE_PATTERN =
  /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i;

export const RECRUITER_PROFILE_FIELD_LIMITS = {
  title: 255,
  companyName: 255,
  bio: 5000,
  phone: 30,
  city: 100,
  country: 100,
  website: 500,
  maxTags: 10,
} as const;

function isNonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function exceedsMaxLength(value: string, max: number): boolean {
  return value.trim().length > max;
}

function validatePhone(phone: string): string | undefined {
  const trimmed = phone.trim();

  if (!trimmed) {
    return undefined;
  }

  if (exceedsMaxLength(trimmed, RECRUITER_PROFILE_FIELD_LIMITS.phone)) {
    return `Phone must be ${RECRUITER_PROFILE_FIELD_LIMITS.phone} characters or fewer.`;
  }

  if (!PHONE_PATTERN.test(trimmed)) {
    return "Enter a valid phone number.";
  }

  return undefined;
}

function validateWebsite(website: string): string | undefined {
  const trimmed = website.trim();

  if (!trimmed) {
    return "Company website is required.";
  }

  if (exceedsMaxLength(trimmed, RECRUITER_PROFILE_FIELD_LIMITS.website)) {
    return `Website must be ${RECRUITER_PROFILE_FIELD_LIMITS.website} characters or fewer.`;
  }

  if (!WEBSITE_PATTERN.test(trimmed)) {
    return "Enter a valid website URL.";
  }

  return undefined;
}

function validateTagSelection(
  values: string[],
  allowed: readonly string[],
  label: string,
): string | undefined {
  if (values.length > RECRUITER_PROFILE_FIELD_LIMITS.maxTags) {
    return `Select up to ${RECRUITER_PROFILE_FIELD_LIMITS.maxTags} ${label.toLowerCase()}.`;
  }

  const invalid = values.find((value) => !allowed.includes(value));

  if (invalid) {
    return `Invalid ${label.toLowerCase()} selection.`;
  }

  return undefined;
}

export type RecruiterDetailsFieldErrors = FieldErrors<
  keyof RecruiterDetailsFields
>;

export type RecruiterCompanyFieldErrors = FieldErrors<
  keyof RecruiterCompanyFields
>;

export type RecruiterAboutFieldErrors = FieldErrors<keyof RecruiterAboutFields>;

export function getRecruiterDetailsFieldErrors(
  input: RecruiterDetailsFields,
): RecruiterDetailsFieldErrors {
  const errors: RecruiterDetailsFieldErrors = {};

  if (!isNonEmpty(input.title)) {
    errors.title = "Job title is required.";
  } else if (exceedsMaxLength(input.title, RECRUITER_PROFILE_FIELD_LIMITS.title)) {
    errors.title = `Job title must be ${RECRUITER_PROFILE_FIELD_LIMITS.title} characters or fewer.`;
  }

  const phoneError = validatePhone(input.phone);
  if (phoneError) {
    errors.phone = phoneError;
  }

  if (!isNonEmpty(input.country)) {
    errors.country = "Country is required.";
  } else if (
    exceedsMaxLength(input.country, RECRUITER_PROFILE_FIELD_LIMITS.country)
  ) {
    errors.country = `Country must be ${RECRUITER_PROFILE_FIELD_LIMITS.country} characters or fewer.`;
  }

  if (!isNonEmpty(input.city)) {
    errors.city = "City is required.";
  } else if (exceedsMaxLength(input.city, RECRUITER_PROFILE_FIELD_LIMITS.city)) {
    errors.city = `City must be ${RECRUITER_PROFILE_FIELD_LIMITS.city} characters or fewer.`;
  }

  return errors;
}

export function getRecruiterCompanyFieldErrors(
  input: RecruiterCompanyFields,
): RecruiterCompanyFieldErrors {
  const errors: RecruiterCompanyFieldErrors = {};

  if (!isNonEmpty(input.companyName)) {
    errors.companyName = "Company name is required.";
  } else if (
    exceedsMaxLength(input.companyName, RECRUITER_PROFILE_FIELD_LIMITS.companyName)
  ) {
    errors.companyName = `Company name must be ${RECRUITER_PROFILE_FIELD_LIMITS.companyName} characters or fewer.`;
  }

  const websiteError = validateWebsite(input.website);
  if (websiteError) {
    errors.website = websiteError;
  }

  if (!isNonEmpty(input.country)) {
    errors.country = "Country is required.";
  } else if (
    exceedsMaxLength(input.country, RECRUITER_PROFILE_FIELD_LIMITS.country)
  ) {
    errors.country = `Country must be ${RECRUITER_PROFILE_FIELD_LIMITS.country} characters or fewer.`;
  }

  if (!isNonEmpty(input.city)) {
    errors.city = "City is required.";
  } else if (exceedsMaxLength(input.city, RECRUITER_PROFILE_FIELD_LIMITS.city)) {
    errors.city = `City must be ${RECRUITER_PROFILE_FIELD_LIMITS.city} characters or fewer.`;
  }

  if (!isNonEmpty(input.employeeCount)) {
    errors.employeeCount = "Number of employees is required.";
  } else if (!(EMPLOYEE_COUNT_VALUES as readonly string[]).includes(input.employeeCount)) {
    errors.employeeCount = "Select a valid employee count range.";
  }

  if (!isNonEmpty(input.hiresPerYear)) {
    errors.hiresPerYear = "Hires per year is required.";
  } else if (!(HIRES_PER_YEAR_VALUES as readonly string[]).includes(input.hiresPerYear)) {
    errors.hiresPerYear = "Select a valid hires per year range.";
  }

  if (!isNonEmpty(input.recruiterType)) {
    errors.recruiterType = "Recruiter type is required.";
  } else if (!(RECRUITER_TYPE_VALUES as readonly string[]).includes(input.recruiterType)) {
    errors.recruiterType = "Select a valid recruiter type.";
  }

  return errors;
}

export function getRecruiterAboutFieldErrors(
  input: RecruiterAboutFields,
): RecruiterAboutFieldErrors {
  const errors: RecruiterAboutFieldErrors = {};

  if (
    exceedsMaxLength(input.bio, RECRUITER_PROFILE_FIELD_LIMITS.bio)
  ) {
    errors.bio = `Bio must be ${RECRUITER_PROFILE_FIELD_LIMITS.bio} characters or fewer.`;
  }

  const specialisationsError = validateTagSelection(
    input.specialisations,
    RECRUITER_SPECIALISATION_OPTIONS,
    "Specialisations",
  );

  if (specialisationsError) {
    errors.specialisations = specialisationsError;
  }

  const industriesError = validateTagSelection(
    input.industries,
    RECRUITER_INDUSTRY_OPTIONS,
    "Industries",
  );

  if (industriesError) {
    errors.industries = industriesError;
  }

  return errors;
}

export function validateRecruiterDetails(input: RecruiterDetailsFields): string | null {
  const errors = getRecruiterDetailsFieldErrors(input);
  const firstError = Object.values(errors).find(Boolean);
  return firstError ?? null;
}

export function validateRecruiterCompany(input: RecruiterCompanyFields): string | null {
  const errors = getRecruiterCompanyFieldErrors(input);
  const firstError = Object.values(errors).find(Boolean);
  return firstError ?? null;
}

export function validateRecruiterAbout(input: RecruiterAboutFields): string | null {
  const errors = getRecruiterAboutFieldErrors(input);
  const firstError = Object.values(errors).find(Boolean);
  return firstError ?? null;
}

export type RecruiterHiringPreferencesFieldErrors = FieldErrors<
  keyof RecruiterHiringPreferencesFields
>;

function validateCodeSelection(
  values: string[],
  allowed: readonly string[],
  label: string,
): string | undefined {
  if (values.length > RECRUITER_PROFILE_FIELD_LIMITS.maxTags) {
    return `Select up to ${RECRUITER_PROFILE_FIELD_LIMITS.maxTags} ${label.toLowerCase()}.`;
  }

  const invalid = values.find((value) => !allowed.includes(value));

  if (invalid) {
    return `Invalid ${label.toLowerCase()} selection.`;
  }

  return undefined;
}

export function getRecruiterHiringPreferencesFieldErrors(
  input: RecruiterHiringPreferencesFields,
): RecruiterHiringPreferencesFieldErrors {
  const errors: RecruiterHiringPreferencesFieldErrors = {};

  const workTypeError = validateCodeSelection(
    input.preferredWorkTypeCodes,
    WORK_TYPE_CODES,
    "Work types",
  );

  if (workTypeError) {
    errors.preferredWorkTypeCodes = workTypeError;
  }

  const experienceError = validateCodeSelection(
    input.preferredExperienceLevels,
    HIRING_EXPERIENCE_LEVEL_VALUES,
    "Experience levels",
  );

  if (experienceError) {
    errors.preferredExperienceLevels = experienceError;
  }

  const remotePreference = input.remotePreference.trim();

  if (
    remotePreference &&
    !(REMOTE_PREFERENCE_VALUES as readonly string[]).includes(remotePreference)
  ) {
    errors.remotePreference = "Select a valid remote preference.";
  }

  if (
    input.preferredWorkTypeCodes.length === 0 &&
    input.preferredExperienceLevels.length === 0 &&
    !remotePreference
  ) {
    errors.preferredWorkTypeCodes =
      "Select at least one hiring preference to save.";
  }

  return errors;
}

export function validateRecruiterHiringPreferences(
  input: RecruiterHiringPreferencesFields,
): string | null {
  const errors = getRecruiterHiringPreferencesFieldErrors(input);
  const firstError = Object.values(errors).find(Boolean);
  return firstError ?? null;
}
