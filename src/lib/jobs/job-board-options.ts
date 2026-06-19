export const CANDIDATE_JOBS_PAGE_SIZE = 5;

export const JOB_CATEGORIES = [
  "All",
  "Technology",
  "Product",
  "Design",
  "Accounting & Finance",
  "Healthcare",
  "Engineering",
  "Marketing",
  "Human Resources",
  "Trades & Services",
] as const;

export const JOB_WORK_TYPES = [
  "Full Time",
  "Part Time",
  "Contract",
  "Labour Hire",
  "Remote",
  "Casual",
] as const;

export const JOB_LOCATIONS = [
  "All Locations",
  "Australia",
  "UK",
  "Canada",
  "Remote",
] as const;

export const JOB_POSTING_CATEGORIES = JOB_CATEGORIES.filter(
  (category) => category !== "All",
);
