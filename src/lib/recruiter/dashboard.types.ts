export type RecruiterDashboardContext = {
  firstName: string;
  lastName: string;
  companyName: string | null;
  jobTitle: string | null;
};

export type RecruiterDashboardCandidate = {
  id: string;
  vodoraId: string;
  firstName: string;
  lastName: string;
  title: string | null;
  city: string | null;
  country: string | null;
  profilePictureUrl: string | null;
  availabilityStatus: string;
  availabilityStart: string | null;
  workTypes: string[];
  skills: string[];
  verified: boolean;
  referenceCount: number;
  isSaved: boolean;
};

export type RecruiterCandidateCardData = RecruiterDashboardCandidate & {
  category?: string | null;
  totalYearsExperience?: number | null;
};

export type RecruiterDashboardData = {
  context: RecruiterDashboardContext;
  candidates: RecruiterDashboardCandidate[];
  candidatesError?: string | null;
  savedCount: number;
};
