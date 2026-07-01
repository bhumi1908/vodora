export type ProfileSectionId =
  | "photo"
  | "overview"
  | "experience"
  | "education"
  | "skills"
  | "documents";

export type EditableExperience = {
  id: string | null;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
};

export type EditableEducation = {
  id: string | null;
  degree: string;
  school: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type EditableSkill = {
  id: string | null;
  name: string;
  proficiency: string;
  yearsExperience: string;
};

export type EditableDocument = {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  isPrimary: boolean;
};

export type CandidateProfileEditData = {
  userId: string;
  candidateId: string;
  name: string;
  avatarInitials: string;
  profilePictureUrl: string | null;
  title: string;
  jobTitleId: string;
  company: string;
  phone: string;
  website: string;
  city: string;
  country: string;
  about: string;
  availabilityStatus: string;
  availabilityStart: string;
  totalYearsExperience: string;
  experienceLevel: string;
  experience: EditableExperience[];
  education: EditableEducation[];
  skills: EditableSkill[];
  documents: EditableDocument[];
};

export const DOCUMENT_TYPE_OPTIONS = [
  { value: "resume", label: "Resume / CV" },
  { value: "experience_letter", label: "Experience Letter" },
  { value: "cover_letter", label: "Cover Letter" },
  { value: "certificate", label: "Certificate" },
  { value: "other", label: "Other" },
] as const;

export const SKILL_PROFICIENCY_OPTIONS = [
  { value: "", label: "Not specified" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
] as const;
