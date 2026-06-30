import type { CandidateProfileData } from "@/lib/profile/types";

export type RecruiterCandidateProfileResult = {
  profile: CandidateProfileData;
  hasReferenceAccess: boolean;
  isSaved: boolean;
};
