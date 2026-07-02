import {
  CANDIDATE_FIND_CANDIDATES_PATH,
  CANDIDATE_FIND_RECRUITERS_PATH,
  CANDIDATE_JOBS_PATH,
  CANDIDATE_PROFILE_PATH,
} from "@/lib/auth/routes";

export interface FooterLinkConfig {
  readonly label: string;
  readonly href: string;
  readonly prefetch?: boolean;
}

export interface FooterColumnConfig {
  readonly title: string;
  readonly links: readonly FooterLinkConfig[];
}

export const FOOTER_COLUMNS: readonly FooterColumnConfig[] = [
  {
    title: "Candidates",
    links: [
      { label: "Create Profile", href: "/signup/candidate" },
      { label: "My Profile", href: CANDIDATE_PROFILE_PATH },
      { label: "Browse Jobs", href: CANDIDATE_JOBS_PATH, prefetch: false },
      {
        label: "Find Recruiters",
        href: CANDIDATE_FIND_RECRUITERS_PATH,
        prefetch: false,
      },
    ],
  },
  {
    title: "Recruiters",
    links: [
      { label: "Recruiter Login", href: "/recruiters" },
      {
        label: "Find Candidates",
        href: CANDIDATE_FIND_CANDIDATES_PATH,
        prefetch: false,
      },
      { label: "Create Recruiter Account", href: "/signup/recruiter" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact-us" },
      { label: "Give Feedback", href: "/feedback" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms-and-conditions" },
    ],
  },
] as const;

export const FOOTER_SECURITY = {
  heading: "We take security and privacy seriously",
  linkLabel: "Learn more about security and compliance.",
  linkHref: "/privacy",
} as const;

export const FOOTER_COPYRIGHT = "Vodora 2026. All Rights Reserved";
