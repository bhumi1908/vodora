export type CandidateProfileSkill = {
  id: string;
  name: string;
  proficiency: string | null;
  yearsExperience: number | null;
};

export type CandidateProfileExperience = {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string | null;
  location: string | null;
};

export type CandidateProfileEducation = {
  id: string;
  degree: string;
  school: string;
  period: string;
  description: string | null;
};

export type CandidateProfileDocument = {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  isPrimary: boolean;
};

import type { SpotlightBlock } from "@/lib/profile/spotlight.types";

export type CandidateProfileData = {
  userId: string;
  candidateId: string | null;
  name: string;
  title: string | null;
  company: string | null;
  location: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  avatarInitials: string;
  profilePictureUrl: string | null;
  about: string | null;
  profession: string | null;
  vodoraId: string | null;
  availabilityStatus: string;
  availabilityStart: string | null;
  spotlightBlocks: SpotlightBlock[];
  skills: CandidateProfileSkill[];
  experience: CandidateProfileExperience[];
  education: CandidateProfileEducation[];
  documents: CandidateProfileDocument[];
};
