export type OwnCandidateProfileUserRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
};

export type OwnCandidateProfileCandidateRow = {
  id: string;
  vodora_id: string;
  profession: string | null;
  current_position: string | null;
  current_company_name: string | null;
  headline: string | null;
  summary: string | null;
  city: string | null;
  country: string | null;
  linkedin_profile_url: string | null;
  profile_picture_url: string | null;
  availability_status: string;
  availability_start: string | null;
};

export type OwnCandidateProfileSkillRow = {
  id: string;
  skill_name: string;
  proficiency: string | null;
  years_experience: number | null;
};

export type OwnCandidateProfileEmploymentRow = {
  id: string;
  job_title: string;
  company_name: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  sort_order: number;
};

export type OwnCandidateProfileEducationRow = {
  id: string;
  degree_or_class: string;
  institution_name: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  sort_order: number;
};

export type OwnCandidateProfileDocumentRow = {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  is_primary: boolean;
};

export type OwnCandidateProfileRpcResult = {
  user: OwnCandidateProfileUserRow | null;
  candidate: OwnCandidateProfileCandidateRow | null;
  skills: OwnCandidateProfileSkillRow[];
  employment: OwnCandidateProfileEmploymentRow[];
  education: OwnCandidateProfileEducationRow[];
  documents: OwnCandidateProfileDocumentRow[];
};
