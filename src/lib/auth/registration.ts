import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CandidateSignupProfile,
  RecruiterSignupProfile,
  SignupProfile,
} from "@/lib/auth/types";
import { getWelcomePath } from "@/lib/auth/routes";

type RegisterClient = SupabaseClient;

export function buildCandidateSignupProfile(
  input: Omit<CandidateSignupProfile, "type">,
): CandidateSignupProfile {
  return {
    type: "candidate",
    country: input.country.trim(),
    city: input.city.trim(),
    profession: input.profession.trim(),
    industryCategoryId: input.industryCategoryId,
    jobTitleId: input.jobTitleId,
    workTypeCodes: input.workTypeCodes,
    termsAccepted: input.termsAccepted,
  };
}

export function buildRecruiterSignupProfile(
  input: Omit<RecruiterSignupProfile, "type">,
): RecruiterSignupProfile {
  return {
    type: "recruiter",
    country: input.country.trim(),
    city: input.city.trim(),
    companyName: input.companyName.trim(),
    jobTitle: input.jobTitle.trim(),
    website: input.website.trim(),
    employeeCountRange: input.employeeCountRange,
    hiresPerYearRange: input.hiresPerYearRange,
    recruiterType: input.recruiterType,
    termsAccepted: input.termsAccepted,
  };
}

export function isSignupProfile(value: unknown): value is SignupProfile {
  if (!value || typeof value !== "object" || !("type" in value)) {
    return false;
  }

  return value.type === "candidate" || value.type === "recruiter";
}

export async function completeSignupProfile(
  supabase: RegisterClient,
  profile: SignupProfile,
) {
  if (profile.type === "candidate") {
    return supabase.rpc("register_candidate", {
      p_country: profile.country,
      p_city: profile.city,
      p_profession: profile.profession,
      p_industry_category_id: profile.industryCategoryId,
      p_job_title_id: profile.jobTitleId,
      p_work_type_codes: profile.workTypeCodes,
      p_terms_accepted: profile.termsAccepted,
    });
  }

  return supabase.rpc("register_recruiter", {
    p_country: profile.country,
    p_city: profile.city,
    p_company_name: profile.companyName,
    p_job_title: profile.jobTitle,
    p_website: profile.website,
    p_employee_count_range: profile.employeeCountRange,
    p_hires_per_year_range: profile.hiresPerYearRange,
    p_recruiter_type: profile.recruiterType,
    p_terms_accepted: profile.termsAccepted,
  });
}

export function getPostSignupRedirect(profile: SignupProfile): string {
  return getWelcomePath(profile.type);
}
