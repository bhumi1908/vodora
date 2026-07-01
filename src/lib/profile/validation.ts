import type {
  EditableEducation,
  EditableExperience,
  EditableSkill,
} from "@/components/profile/edit/types";
import {
  entryFieldKey,
  type FieldErrors,
  firstFieldError,
} from "@/lib/form/field-errors";
import {
  validateAvailabilityStart,
  validateAvailabilityStatus,
} from "@/lib/profile/availability";
import {
  validateExperienceLevel,
  validateTotalYearsExperience,
} from "@/lib/profile/experience";

export const MAX_PROFILE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_PROFILE_FILE_SIZE_LABEL = "5 MB";

const PHONE_PATTERN = /^[+]?[\d\s().-]{7,30}$/;
const WEBSITE_PATTERN =
  /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i;

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const PROFILE_FIELD_LIMITS = {
  title: 255,
  company: 255,
  location: 255,
  about: 5000,
  skillName: 100,
  degree: 255,
  school: 255,
  description: 5000,
  phone: 30,
  city: 100,
  country: 100,
  website: 500,
  maxSkillYears: 60,
  maxTotalYearsExperience: 60,
} as const;

function isNonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function exceedsMaxLength(value: string, max: number): boolean {
  return value.trim().length > max;
}

export function getMaxMonthInput(referenceDate = new Date()): string {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function isFutureMonthInput(
  value: string,
  referenceDate = new Date(),
): boolean {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  return trimmed > getMaxMonthInput(referenceDate);
}

export function isMonthRangeInvalid(startDate: string, endDate: string): boolean {
  const start = startDate.trim();
  const end = endDate.trim();

  if (!start || !end) {
    return false;
  }

  return end < start;
}

export function validateMonthField(
  value: string,
  label: string,
  options: { required?: boolean; referenceDate?: Date } = {},
): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return options.required ? `${label} is required.` : null;
  }

  if (!/^\d{4}-\d{2}$/.test(trimmed)) {
    return `${label} must be a valid month and year.`;
  }

  if (isFutureMonthInput(trimmed, options.referenceDate)) {
    return `${label} cannot be in the future.`;
  }

  return null;
}

export function validateProfileFile(
  file: File,
  options: { imagesOnly?: boolean } = {},
): string | null {
  if (file.size === 0) {
    return "Please choose a file to upload.";
  }

  if (file.size > MAX_PROFILE_FILE_SIZE_BYTES) {
    return `File must be ${MAX_PROFILE_FILE_SIZE_LABEL} or smaller.`;
  }

  const allowedTypes = options.imagesOnly
    ? ALLOWED_IMAGE_MIME_TYPES
    : ALLOWED_DOCUMENT_MIME_TYPES;

  if (!allowedTypes.has(file.type)) {
    return options.imagesOnly
      ? "Profile photo must be a JPEG, PNG, or WebP image."
      : "Unsupported file type. Upload PDF, Word, JPEG, PNG, or WebP files.";
  }

  return null;
}

export type OverviewFieldErrors = FieldErrors<
  | "about"
  | "title"
  | "company"
  | "phone"
  | "website"
  | "city"
  | "country"
  | "availabilityStatus"
  | "availabilityStart"
  | "totalYearsExperience"
  | "experienceLevel"
>;

export function getOverviewFieldErrors(input: {
  about?: string;
  title?: string;
  company?: string;
  phone?: string;
  website?: string;
  city?: string;
  country?: string;
  availabilityStatus?: string;
  availabilityStart?: string;
  totalYearsExperience?: string;
  experienceLevel?: string;
}): OverviewFieldErrors {
  const errors: OverviewFieldErrors = {};
  const title = input.title?.trim() ?? "";
  const company = input.company?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const website = input.website?.trim() ?? "";
  const city = input.city?.trim() ?? "";
  const country = input.country?.trim() ?? "";
  const about = input.about?.trim() ?? "";

  const availabilityStatusError = validateAvailabilityStatus(
    input.availabilityStatus,
  );

  if (availabilityStatusError) {
    errors.availabilityStatus = availabilityStatusError;
  }

  const availabilityStartError = validateAvailabilityStart(
    input.availabilityStart,
    input.availabilityStatus,
  );

  if (availabilityStartError) {
    errors.availabilityStart = availabilityStartError;
  }

  const experienceLevelError = validateExperienceLevel(input.experienceLevel);

  if (experienceLevelError) {
    errors.experienceLevel = experienceLevelError;
  }

  const totalYearsError = validateTotalYearsExperience(
    input.totalYearsExperience,
    PROFILE_FIELD_LIMITS.maxTotalYearsExperience,
  );

  if (totalYearsError) {
    errors.totalYearsExperience = totalYearsError;
  }

  if (exceedsMaxLength(title, PROFILE_FIELD_LIMITS.title)) {
    errors.title = `Headline must be ${PROFILE_FIELD_LIMITS.title} characters or fewer.`;
  }

  if (exceedsMaxLength(company, PROFILE_FIELD_LIMITS.company)) {
    errors.company = `Company must be ${PROFILE_FIELD_LIMITS.company} characters or fewer.`;
  }

  if (exceedsMaxLength(city, PROFILE_FIELD_LIMITS.city)) {
    errors.city = `City must be ${PROFILE_FIELD_LIMITS.city} characters or fewer.`;
  }

  if (exceedsMaxLength(country, PROFILE_FIELD_LIMITS.country)) {
    errors.country = `Country must be ${PROFILE_FIELD_LIMITS.country} characters or fewer.`;
  }

  if (exceedsMaxLength(about, PROFILE_FIELD_LIMITS.about)) {
    errors.about = `About section must be ${PROFILE_FIELD_LIMITS.about} characters or fewer.`;
  }

  if (phone && !PHONE_PATTERN.test(phone)) {
    errors.phone = "Please enter a valid phone number.";
  } else if (phone && exceedsMaxLength(phone, PROFILE_FIELD_LIMITS.phone)) {
    errors.phone = `Phone number must be ${PROFILE_FIELD_LIMITS.phone} characters or fewer.`;
  }

  if (website) {
    if (exceedsMaxLength(website, PROFILE_FIELD_LIMITS.website)) {
      errors.website = `Website or LinkedIn URL must be ${PROFILE_FIELD_LIMITS.website} characters or fewer.`;
    } else if (!WEBSITE_PATTERN.test(website)) {
      errors.website = "Please enter a valid website or LinkedIn URL.";
    }
  }

  return errors;
}

export function validateOverview(input: {
  about?: string;
  title?: string;
  company?: string;
  phone?: string;
  website?: string;
  city?: string;
  country?: string;
  availabilityStatus?: string;
  availabilityStart?: string;
  totalYearsExperience?: string;
  experienceLevel?: string;
}): string | null {
  return firstFieldError(getOverviewFieldErrors(input));
}

export type ExperienceEntryFieldErrors = FieldErrors<string>;

export function getExperienceFieldErrors(
  entries: EditableExperience[],
): ExperienceEntryFieldErrors {
  const errors: ExperienceEntryFieldErrors = {};

  for (const [index, entry] of entries.entries()) {
    const title = entry.title?.trim() ?? "";
    const company = entry.company?.trim() ?? "";
    const location = entry.location?.trim() ?? "";
    const description = entry.description?.trim() ?? "";

    if (!isNonEmpty(title)) {
      errors[entryFieldKey(index, "title")] = "Job title is required.";
    } else if (exceedsMaxLength(title, PROFILE_FIELD_LIMITS.title)) {
      errors[entryFieldKey(index, "title")] =
        `Job title must be ${PROFILE_FIELD_LIMITS.title} characters or fewer.`;
    }

    if (!isNonEmpty(company)) {
      errors[entryFieldKey(index, "company")] = "Company is required.";
    } else if (exceedsMaxLength(company, PROFILE_FIELD_LIMITS.company)) {
      errors[entryFieldKey(index, "company")] =
        `Company must be ${PROFILE_FIELD_LIMITS.company} characters or fewer.`;
    }

    if (exceedsMaxLength(location, PROFILE_FIELD_LIMITS.location)) {
      errors[entryFieldKey(index, "location")] =
        `Location must be ${PROFILE_FIELD_LIMITS.location} characters or fewer.`;
    }

    if (exceedsMaxLength(description, PROFILE_FIELD_LIMITS.description)) {
      errors[entryFieldKey(index, "description")] =
        `Description must be ${PROFILE_FIELD_LIMITS.description} characters or fewer.`;
    }

    const startDateError = validateMonthField(entry.startDate, "Start date", {
      required: true,
    });

    if (startDateError) {
      errors[entryFieldKey(index, "startDate")] = startDateError;
    }

    if (!entry.isCurrent) {
      const endDateError = validateMonthField(entry.endDate, "End date", {
        required: true,
      });

      if (endDateError) {
        errors[entryFieldKey(index, "endDate")] = endDateError;
      } else if (isMonthRangeInvalid(entry.startDate, entry.endDate)) {
        errors[entryFieldKey(index, "endDate")] =
          "End date must be on or after the start date.";
      }
    }
  }

  return errors;
}

export function validateExperienceEntries(
  entries: EditableExperience[],
): string | null {
  return firstFieldError(getExperienceFieldErrors(entries));
}

export type EducationEntryFieldErrors = FieldErrors<string>;

export function getEducationFieldErrors(
  entries: EditableEducation[],
): EducationEntryFieldErrors {
  const errors: EducationEntryFieldErrors = {};

  for (const [index, entry] of entries.entries()) {
    const degree = entry.degree?.trim() ?? "";
    const school = entry.school?.trim() ?? "";
    const description = entry.description?.trim() ?? "";

    if (!isNonEmpty(degree)) {
      errors[entryFieldKey(index, "degree")] = "Degree or qualification is required.";
    } else if (exceedsMaxLength(degree, PROFILE_FIELD_LIMITS.degree)) {
      errors[entryFieldKey(index, "degree")] =
        `Degree must be ${PROFILE_FIELD_LIMITS.degree} characters or fewer.`;
    }

    if (!isNonEmpty(school)) {
      errors[entryFieldKey(index, "school")] = "Institution is required.";
    } else if (exceedsMaxLength(school, PROFILE_FIELD_LIMITS.school)) {
      errors[entryFieldKey(index, "school")] =
        `Institution must be ${PROFILE_FIELD_LIMITS.school} characters or fewer.`;
    }

    if (exceedsMaxLength(description, PROFILE_FIELD_LIMITS.description)) {
      errors[entryFieldKey(index, "description")] =
        `Details must be ${PROFILE_FIELD_LIMITS.description} characters or fewer.`;
    }

    const startDateError = validateMonthField(entry.startDate, "Start date");

    if (startDateError) {
      errors[entryFieldKey(index, "startDate")] = startDateError;
    }

    const endDateError = validateMonthField(entry.endDate, "End date");

    if (endDateError) {
      errors[entryFieldKey(index, "endDate")] = endDateError;
    } else if (isMonthRangeInvalid(entry.startDate, entry.endDate)) {
      errors[entryFieldKey(index, "endDate")] =
        "End date must be on or after the start date.";
    }
  }

  return errors;
}

export function validateEducationEntries(
  entries: EditableEducation[],
): string | null {
  return firstFieldError(getEducationFieldErrors(entries));
}

export type SkillsEntryFieldErrors = FieldErrors<string>;

export function getSkillsFieldErrors(
  entries: EditableSkill[],
): SkillsEntryFieldErrors {
  const errors: SkillsEntryFieldErrors = {};
  const seenNames = new Set<string>();

  for (const [index, entry] of entries.entries()) {
    const name = entry.name?.trim() ?? "";
    const years = entry.yearsExperience?.trim() ?? "";

    if (!isNonEmpty(name)) {
      errors[entryFieldKey(index, "name")] = "Skill name is required.";
    } else {
      if (exceedsMaxLength(name, PROFILE_FIELD_LIMITS.skillName)) {
        errors[entryFieldKey(index, "name")] =
          `Skill name must be ${PROFILE_FIELD_LIMITS.skillName} characters or fewer.`;
      }

      const normalized = name.toLowerCase();

      if (seenNames.has(normalized)) {
        errors[entryFieldKey(index, "name")] = `Duplicate skill: ${name}`;
      }

      seenNames.add(normalized);
    }

    if (years) {
      const parsedYears = Number.parseInt(years, 10);

      if (Number.isNaN(parsedYears) || parsedYears < 0) {
        errors[entryFieldKey(index, "yearsExperience")] =
          "Years of experience must be a valid number.";
      } else if (parsedYears > PROFILE_FIELD_LIMITS.maxSkillYears) {
        errors[entryFieldKey(index, "yearsExperience")] =
          `Years of experience cannot exceed ${PROFILE_FIELD_LIMITS.maxSkillYears}.`;
      }
    }
  }

  return errors;
}

export function validateSkillsEntries(entries: EditableSkill[]): string | null {
  return firstFieldError(getSkillsFieldErrors(entries));
}

export type ExperienceEntryPayload = {
  id?: string | null;
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
};

export type EducationEntryPayload = {
  id?: string | null;
  degree?: string;
  school?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

export function validateExperiencePayload(
  entries: ExperienceEntryPayload[],
): string | null {
  return validateExperienceEntries(
    entries.map((entry) => ({
      id: entry.id ?? null,
      title: entry.title ?? "",
      company: entry.company ?? "",
      location: entry.location ?? "",
      startDate: entry.startDate ?? "",
      endDate: entry.endDate ?? "",
      isCurrent: Boolean(entry.isCurrent),
      description: entry.description ?? "",
    })),
  );
}

export function validateEducationPayload(
  entries: EducationEntryPayload[],
): string | null {
  return validateEducationEntries(
    entries.map((entry) => ({
      id: entry.id ?? null,
      degree: entry.degree ?? "",
      school: entry.school ?? "",
      startDate: entry.startDate ?? "",
      endDate: entry.endDate ?? "",
      description: entry.description ?? "",
    })),
  );
}
