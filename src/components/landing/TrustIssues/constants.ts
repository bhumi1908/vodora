export interface IssueItem {
  readonly number: number;
  readonly title: string;
  readonly description: string;
  readonly isFirst: boolean;
}

export interface TabItem {
  readonly id: string;
  readonly label: string;
}

export const TRUST_TABS: readonly TabItem[] = [
  { id: "candidate", label: "Candidate Pain" },
  { id: "recruiter", label: "Recruiter Pain" },
] as const;

export const CANDIDATE_PAIN_ISSUES: readonly IssueItem[] = [
  {
    number: 1,
    title: "Repeatedly provide the same references",
    description: "Start every single application by tracking down referees again.",
    isFirst: true,
  },
  {
    number: 2,
    title: "No ownership of reputation",
    description: "You earn the trust, but never actually own it.",
    isFirst: false,
  },
  {
    number: 3,
    title: "Managers receive endless calls",
    description: "Former bosses field repeated reference calls for one candidate.",
    isFirst: false,
  },
  {
    number: 4,
    title: "References disappear between recruiters",
    description: "Each verification vanishes the moment a recruiter moves on.",
    isFirst: false,
  },
] as const;

export const RECRUITER_PAIN_ISSUES: readonly IssueItem[] = [
  {
    number: 1,
    title: "No standardized verification process",
    description: "Every recruiter checks references differently with no consistency.",
    isFirst: true,
  },
  {
    number: 2,
    title: "Wasted time chasing references",
    description: "Hours spent tracking down the same contacts for different candidates.",
    isFirst: false,
  },
  {
    number: 3,
    title: "Unverified candidate claims",
    description: "No reliable way to confirm work history and achievements quickly.",
    isFirst: false,
  },
  {
    number: 4,
    title: "Duplicate effort across teams",
    description: "Multiple recruiters verify the same candidate independently.",
    isFirst: false,
  },
] as const;

export const ISSUES_BY_TAB: Record<string, readonly IssueItem[]> = {
  candidate: CANDIDATE_PAIN_ISSUES,
  recruiter: RECRUITER_PAIN_ISSUES,
};
