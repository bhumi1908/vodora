import type { JobApplicationStatus } from "@/lib/jobs/candidate-jobs.types";
import type {
  CandidateProfileEducation,
  CandidateProfileExperience,
  CandidateProfileSkill,
} from "@/lib/profile/types";
import type { CandidateReferenceItem } from "@/lib/references/fetch-candidate-references";

export type RecruiterJobApplicationDocument = {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
};

export type RecruiterJobApplicantSummary = {
  applicationId: string;
  candidateId: string;
  vodoraId: string;
  name: string;
  title: string | null;
  company: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  profilePictureUrl: string | null;
  avatarInitials: string;
  status: JobApplicationStatus;
  isNew: boolean;
  appliedAt: string;
  appliedLabel: string;
  coverLetter: string;
  referencesAttached: boolean;
  referenceCount: number;
  resume: RecruiterJobApplicationDocument | null;
  coverLetterDocument: RecruiterJobApplicationDocument | null;
};

export type RecruiterJobApplicantsJobSummary = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  urgent: boolean;
  status: string;
  applicantCount: number;
};

export type RecruiterJobApplicantsResponse = {
  job: RecruiterJobApplicantsJobSummary;
  applicants: RecruiterJobApplicantSummary[];
};

export type RecruiterJobApplicantDetail = RecruiterJobApplicantSummary & {
  references: CandidateReferenceItem[];
  website: string | null;
  about: string | null;
  experience: CandidateProfileExperience[];
  education: CandidateProfileEducation[];
  skills: CandidateProfileSkill[];
};
