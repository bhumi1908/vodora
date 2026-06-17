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
};

export type RecruiterDashboardData = {
  context: RecruiterDashboardContext;
  candidates: RecruiterDashboardCandidate[];
  candidatesError?: string | null;
};
