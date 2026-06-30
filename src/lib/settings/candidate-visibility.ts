export const CANDIDATE_VISIBILITY_VALUES = [
  "private",
  "recruiters_only",
  "public",
] as const;

export type CandidateVisibility = (typeof CANDIDATE_VISIBILITY_VALUES)[number];

export type CandidateVisibilityOption = {
  value: CandidateVisibility;
  label: string;
  description: string;
};

export const CANDIDATE_VISIBILITY_OPTIONS: CandidateVisibilityOption[] = [
  {
    value: "private",
    label: "Private",
    description: "Only you can view your profile. You won't appear in search or discovery.",
  },
  {
    value: "recruiters_only",
    label: "Recruiters Only",
    description:
      "Recruiters can find and view your profile. Other candidates cannot discover you.",
  },
  {
    value: "public",
    label: "Public",
    description:
      "Recruiters and other candidates can find and view your profile.",
  },
];

export function isCandidateVisibility(
  value: string,
): value is CandidateVisibility {
  return CANDIDATE_VISIBILITY_VALUES.includes(value as CandidateVisibility);
}

export const DEFAULT_CANDIDATE_VISIBILITY: CandidateVisibility = "recruiters_only";
