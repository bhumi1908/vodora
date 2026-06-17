import type {
  EditableEducation,
  EditableExperience,
  EditableSkill,
} from "@/components/profile/edit/types";
import {
  validateAvailabilityStart,
  validateAvailabilityStatus,
} from "@/lib/profile/availability";

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
}): string | null {
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
    return availabilityStatusError;
  }

  const availabilityStartError = validateAvailabilityStart(
    input.availabilityStart,
  );

  if (availabilityStartError) {
    return availabilityStartError;
  }

  if (exceedsMaxLength(title, PROFILE_FIELD_LIMITS.title)) {
    return `Headline must be ${PROFILE_FIELD_LIMITS.title} characters or fewer.`;
  }

  if (exceedsMaxLength(company, PROFILE_FIELD_LIMITS.company)) {
    return `Company must be ${PROFILE_FIELD_LIMITS.company} characters or fewer.`;
  }

  if (exceedsMaxLength(city, PROFILE_FIELD_LIMITS.city)) {
    return `City must be ${PROFILE_FIELD_LIMITS.city} characters or fewer.`;
  }

  if (exceedsMaxLength(country, PROFILE_FIELD_LIMITS.country)) {
    return `Country must be ${PROFILE_FIELD_LIMITS.country} characters or fewer.`;
  }

  if (exceedsMaxLength(about, PROFILE_FIELD_LIMITS.about)) {
    return `About section must be ${PROFILE_FIELD_LIMITS.about} characters or fewer.`;
  }

  if (phone && !PHONE_PATTERN.test(phone)) {
    return "Please enter a valid phone number.";
  }

  if (phone && exceedsMaxLength(phone, PROFILE_FIELD_LIMITS.phone)) {
    return `Phone number must be ${PROFILE_FIELD_LIMITS.phone} characters or fewer.`;
  }

  if (website) {
    if (exceedsMaxLength(website, PROFILE_FIELD_LIMITS.website)) {
      return `Website or LinkedIn URL must be ${PROFILE_FIELD_LIMITS.website} characters or fewer.`;
    }

    if (!WEBSITE_PATTERN.test(website)) {
      return "Please enter a valid website or LinkedIn URL.";
    }
  }

  return null;
}

export function validateExperienceEntries(
  entries: EditableExperience[],
): string | null {
  for (const [index, entry] of entries.entries()) {
    const label = entries.length > 1 ? `Role ${index + 1}` : "This role";
    const title = entry.title?.trim() ?? "";
    const company = entry.company?.trim() ?? "";
    const location = entry.location?.trim() ?? "";
    const description = entry.description?.trim() ?? "";

    if (!isNonEmpty(title)) {
      return `${label}: Job title is required.`;
    }

    if (!isNonEmpty(company)) {
      return `${label}: Company is required.`;
    }

    if (exceedsMaxLength(title, PROFILE_FIELD_LIMITS.title)) {
      return `${label}: Job title must be ${PROFILE_FIELD_LIMITS.title} characters or fewer.`;
    }

    if (exceedsMaxLength(company, PROFILE_FIELD_LIMITS.company)) {
      return `${label}: Company must be ${PROFILE_FIELD_LIMITS.company} characters or fewer.`;
    }

    if (exceedsMaxLength(location, PROFILE_FIELD_LIMITS.location)) {
      return `${label}: Location must be ${PROFILE_FIELD_LIMITS.location} characters or fewer.`;
    }

    if (exceedsMaxLength(description, PROFILE_FIELD_LIMITS.description)) {
      return `${label}: Description must be ${PROFILE_FIELD_LIMITS.description} characters or fewer.`;
    }

    const startDateError = validateMonthField(entry.startDate, `${label}: Start date`, {
      required: true,
    });

    if (startDateError) {
      return startDateError;
    }

    if (!entry.isCurrent) {
      const endDateError = validateMonthField(entry.endDate, `${label}: End date`, {
        required: true,
      });

      if (endDateError) {
        return endDateError;
      }

      if (isMonthRangeInvalid(entry.startDate, entry.endDate)) {
        return `${label}: End date must be on or after the start date.`;
      }
    }
  }

  return null;
}

export function validateEducationEntries(
  entries: EditableEducation[],
): string | null {
  for (const [index, entry] of entries.entries()) {
    const label =
      entries.length > 1 ? `Qualification ${index + 1}` : "This qualification";
    const degree = entry.degree?.trim() ?? "";
    const school = entry.school?.trim() ?? "";
    const description = entry.description?.trim() ?? "";

    if (!isNonEmpty(degree)) {
      return `${label}: Degree or qualification is required.`;
    }

    if (!isNonEmpty(school)) {
      return `${label}: Institution is required.`;
    }

    if (exceedsMaxLength(degree, PROFILE_FIELD_LIMITS.degree)) {
      return `${label}: Degree must be ${PROFILE_FIELD_LIMITS.degree} characters or fewer.`;
    }

    if (exceedsMaxLength(school, PROFILE_FIELD_LIMITS.school)) {
      return `${label}: Institution must be ${PROFILE_FIELD_LIMITS.school} characters or fewer.`;
    }

    if (exceedsMaxLength(description, PROFILE_FIELD_LIMITS.description)) {
      return `${label}: Details must be ${PROFILE_FIELD_LIMITS.description} characters or fewer.`;
    }

    const startDateError = validateMonthField(
      entry.startDate,
      `${label}: Start date`,
    );

    if (startDateError) {
      return startDateError;
    }

    const endDateError = validateMonthField(entry.endDate, `${label}: End date`);

    if (endDateError) {
      return endDateError;
    }

    if (isMonthRangeInvalid(entry.startDate, entry.endDate)) {
      return `${label}: End date must be on or after the start date.`;
    }
  }

  return null;
}

export function validateSkillsEntries(entries: EditableSkill[]): string | null {
  const seenNames = new Set<string>();

  for (const [index, entry] of entries.entries()) {
    const label = entries.length > 1 ? `Skill ${index + 1}` : "This skill";
    const name = entry.name?.trim() ?? "";
    const years = entry.yearsExperience?.trim() ?? "";

    if (!isNonEmpty(name)) {
      return `${label}: Skill name is required.`;
    }

    if (exceedsMaxLength(name, PROFILE_FIELD_LIMITS.skillName)) {
      return `${label}: Skill name must be ${PROFILE_FIELD_LIMITS.skillName} characters or fewer.`;
    }

    const normalized = name.toLowerCase();

    if (seenNames.has(normalized)) {
      return `Duplicate skill: ${name}`;
    }

    seenNames.add(normalized);

    if (years) {
      const parsedYears = Number.parseInt(years, 10);

      if (Number.isNaN(parsedYears) || parsedYears < 0) {
        return `${label}: Years of experience must be a valid number.`;
      }

      if (parsedYears > PROFILE_FIELD_LIMITS.maxSkillYears) {
        return `${label}: Years of experience cannot exceed ${PROFILE_FIELD_LIMITS.maxSkillYears}.`;
      }
    }
  }

  return null;
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
