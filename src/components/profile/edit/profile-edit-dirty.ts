import type {
  CandidateProfileEditData,
  EditableDocument,
  EditableEducation,
  EditableExperience,
  EditableSkill,
} from "@/components/profile/edit/types";

export type OverviewFields = Pick<
  CandidateProfileEditData,
  | "about"
  | "title"
  | "jobTitleId"
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

function stableSerialize(value: unknown): string {
  return JSON.stringify(value);
}

export function isOverviewDirty(
  saved: OverviewFields,
  current: OverviewFields,
): boolean {
  return stableSerialize(saved) !== stableSerialize(current);
}

export function isExperienceDirty(
  saved: EditableExperience[],
  current: EditableExperience[],
): boolean {
  return stableSerialize(saved) !== stableSerialize(current);
}

export function isEducationDirty(
  saved: EditableEducation[],
  current: EditableEducation[],
): boolean {
  return stableSerialize(saved) !== stableSerialize(current);
}

export function isSkillsDirty(
  saved: EditableSkill[],
  current: EditableSkill[],
): boolean {
  return stableSerialize(saved) !== stableSerialize(current);
}

export function isDocumentsDirty(
  saved: EditableDocument[],
  current: EditableDocument[],
): boolean {
  return stableSerialize(saved) !== stableSerialize(current);
}
