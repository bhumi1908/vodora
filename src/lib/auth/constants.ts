export const WORK_TYPE_OPTIONS = [
  { code: "full_time", label: "Full Time" },
  { code: "part_time", label: "Part Time" },
  { code: "contract", label: "Contract" },
  { code: "freelance", label: "Freelance" },
  { code: "labour_hire", label: "Labour Hire" },
  { code: "casual", label: "Casual" },
  { code: "remote", label: "Remote" },
  { code: "fifo", label: "FIFO (Fly-In Fly-Out)" },
] as const;

export const EMPLOYEE_COUNT_OPTIONS = [
  { value: "1-10", label: "1-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-200", label: "51-200" },
  { value: "201-500", label: "201-500" },
  { value: "501-1000", label: "501-1000" },
  { value: "1000+", label: "1000+" },
] as const;

export const HIRES_PER_YEAR_OPTIONS = [
  { value: "1-5", label: "1-5" },
  { value: "6-20", label: "6-20" },
  { value: "21-50", label: "21-50" },
  { value: "51-100", label: "51-100" },
  { value: "100+", label: "100+" },
] as const;

export const RECRUITER_TYPE_OPTIONS = [
  { value: "internal_recruiter", label: "Internal Recruiter" },
  { value: "recruitment_agency", label: "Recruitment Agency" },
  { value: "labour_hire_company", label: "Labour Hire Company" },
  { value: "hiring_manager", label: "Hiring Manager" },
  { value: "business_owner", label: "Business Owner" },
] as const;

export const MIN_PASSWORD_LENGTH = 8;

export const RECRUITER_TYPE_VALUES = RECRUITER_TYPE_OPTIONS.map(
  (option) => option.value,
);

export const EMPLOYEE_COUNT_VALUES = EMPLOYEE_COUNT_OPTIONS.map(
  (option) => option.value,
);

export const HIRES_PER_YEAR_VALUES = HIRES_PER_YEAR_OPTIONS.map(
  (option) => option.value,
);

export const WORK_TYPE_CODES = WORK_TYPE_OPTIONS.map((option) => option.code);

/** Free/personal email domains blocked for recruiter accounts. */
export const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "mail.com",
  "gmx.com",
  "msn.com",
  "yopmail.com",
] as const;
