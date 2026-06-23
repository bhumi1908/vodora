export type CandidateSignupProfile = {
  type: "candidate";
  country: string;
  city: string;
  profession: string;
  industryCategoryId: string | null;
  jobTitleId: string;
  workTypeCodes: string[];
  termsAccepted: boolean;
};

export type RecruiterSignupProfile = {
  type: "recruiter";
  country: string;
  city: string;
  companyName: string;
  jobTitle: string;
  website: string;
  employeeCountRange: string;
  hiresPerYearRange: string;
  recruiterType: string;
  termsAccepted: boolean;
};

export type SignupProfile = CandidateSignupProfile | RecruiterSignupProfile;

export type CandidateSignupRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  city: string;
  jobTitleId: string;
  workTypeCodes: string[];
  agreedToTerms: boolean;
  redirect?: string;
};

export type RecruiterSignupRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  city: string;
  companyName: string;
  position: string;
  website: string;
  employeeCount: string;
  hiresPerYear: string;
  recruiterType: string;
  agreedToTerms: boolean;
};

export type SignupApiResponse = {
  success: boolean;
  needsEmailConfirmation?: boolean;
  email?: string;
  redirectTo?: string;
  error?: string;
};

export type ResendVerificationApiResponse = {
  success: boolean;
  error?: string;
};

export type LoginApiResponse = {
  success: boolean;
  redirectTo?: string;
  needsEmailVerification?: boolean;
  error?: string;
};

export type ForgotPasswordApiResponse = {
  success: boolean;
  error?: string;
};

export type ResetPasswordApiResponse = {
  success: boolean;
  redirectTo?: string;
  error?: string;
};

export type ChangePasswordApiResponse = {
  success: boolean;
  redirectTo?: string;
  error?: string;
};

