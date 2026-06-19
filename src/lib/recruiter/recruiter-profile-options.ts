export const RECRUITER_SPECIALISATION_OPTIONS = [
  "Software Engineering",
  "Product Management",
  "Data Science",
  "DevOps",
  "UX Design",
  "Sales",
  "Marketing",
  "Finance",
  "Human Resources",
  "Operations",
] as const;

export const RECRUITER_INDUSTRY_OPTIONS = [
  "Technology",
  "FinTech",
  "SaaS",
  "E-commerce",
  "Healthcare Tech",
  "Manufacturing",
  "Construction",
  "Education",
  "Government",
  "Retail",
] as const;

export type RecruiterSpecialisationOption =
  (typeof RECRUITER_SPECIALISATION_OPTIONS)[number];

export type RecruiterIndustryOption = (typeof RECRUITER_INDUSTRY_OPTIONS)[number];
