import type {
  CandidateProfileEditData,
  EditableDocument,
  EditableEducation,
  EditableExperience,
  EditableSkill,
} from "@/components/profile/edit/types";

export function createEmptyExperience(): EditableExperience {
  return {
    id: null,
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
  };
}

export function createEmptyEducation(): EditableEducation {
  return {
    id: null,
    degree: "",
    school: "",
    startDate: "",
    endDate: "",
    description: "",
  };
}

export function createEmptySkill(): EditableSkill {
  return {
    id: null,
    name: "",
    proficiency: "",
    yearsExperience: "",
  };
}

export function cloneProfileEditData(
  profile: CandidateProfileEditData,
): CandidateProfileEditData {
  return {
    ...profile,
    experience: profile.experience.map((entry) => ({ ...entry })),
    education: profile.education.map((entry) => ({ ...entry })),
    skills: profile.skills.map((entry) => ({ ...entry })),
    documents: profile.documents.map((entry) => ({ ...entry })),
  };
}

export function appendDocument(
  profile: CandidateProfileEditData,
  document: EditableDocument,
): CandidateProfileEditData {
  return {
    ...profile,
    documents: [document, ...profile.documents],
  };
}

export function removeDocument(
  profile: CandidateProfileEditData,
  documentId: string,
): CandidateProfileEditData {
  return {
    ...profile,
    documents: profile.documents.filter((document) => document.id !== documentId),
  };
}

export function updateProfilePhoto(
  profile: CandidateProfileEditData,
  profilePictureUrl: string,
): CandidateProfileEditData {
  return {
    ...profile,
    profilePictureUrl,
  };
}
