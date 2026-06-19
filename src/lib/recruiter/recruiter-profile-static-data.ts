export const RECRUITER_PROFILE_STATIC_RATING = 4.8;

export const RECRUITER_PROFILE_STATIC_STATS = {
  totalPlacements: "312",
  activeRoles: "3",
  candidatesWorkedWith: "1,480",
  avgTimeToHire: "11 days",
} as const;

export const RECRUITER_PROFILE_STATIC_SPECIALISATIONS = [
  "Software Engineering",
  "Product Management",
  "Data Science",
  "DevOps",
  "UX Design",
] as const;

export const RECRUITER_PROFILE_STATIC_INDUSTRIES = [
  "Technology",
  "FinTech",
  "SaaS",
  "E-commerce",
  "Healthcare Tech",
] as const;

export const RECRUITER_PROFILE_STATIC_ACTIVE_ROLES = [
  {
    id: "1",
    title: "Senior Software Engineer",
    type: "Full Time",
    location: "Sydney / Remote",
    salary: "$150k–$180k",
    applicants: 24,
    posted: "3 days ago",
    urgent: true,
  },
  {
    id: "2",
    title: "Product Manager",
    type: "Full Time",
    location: "Melbourne",
    salary: "$130k–$160k",
    applicants: 18,
    posted: "1 week ago",
    urgent: false,
  },
  {
    id: "3",
    title: "UX Designer",
    type: "Contract",
    location: "Remote",
    salary: "$900/day",
    applicants: 31,
    posted: "5 days ago",
    urgent: false,
  },
] as const;

export const RECRUITER_PROFILE_STATIC_RECENT_PLACEMENTS = [
  {
    name: "A. Clarke",
    role: "Engineering Lead",
    company: "BuildTeam",
    timeToHire: "9 days",
    avatar: "AC",
  },
  {
    name: "M. Webb",
    role: "Senior PM",
    company: "InnovateCo",
    timeToHire: "14 days",
    avatar: "MW",
  },
  {
    name: "P. Nair",
    role: "Data Scientist",
    company: "AnalyticsPro",
    timeToHire: "11 days",
    avatar: "PN",
  },
  {
    name: "S. Tanaka",
    role: "DevOps Engineer",
    company: "CloudStack",
    timeToHire: "8 days",
    avatar: "ST",
  },
] as const;
