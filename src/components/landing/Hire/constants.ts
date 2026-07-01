export interface HireFeatureCardConfig {
  readonly id: string;
  readonly title: string;
  readonly descriptionLines: readonly [string, string];
  readonly iconSrc: string;
}

export const HIRE_SECTION = {
  title: "Hire Faster. Verify Less.",
  description:
    "Access pre-verified candidates with trusted references and save weeks in the hiring process",
} as const;

export const HIRE_CARD = {
  width: 434,
  height: 539,
} as const;

const HIRE_ICONS_BASE = "/Images/hiringSectionIcons";

export const HIRE_FEATURE_CARDS: readonly HireFeatureCardConfig[] = [
  {
    id: "candidate-search",
    title: "Candidate Search",
    descriptionLines: [
      "Browse a pool of pre-verified candidates whose references and history are already",
      "confirmed, ready to view instantly.",
    ],
    iconSrc: `${HIRE_ICONS_BASE}/Group 63.svg`,
  },
  {
    id: "skills-filtering",
    title: "Skills Filtering",
    descriptionLines: [
      "Narrow your search by specific skills and expertise to surface only the",
      "candidates who genuinely fit your role.",
    ],
    iconSrc: `${HIRE_ICONS_BASE}/Group 64.svg`,
  },
  {
    id: "location-search",
    title: "Country & City Search",
    descriptionLines: [
      "Find talent by location, whether you're hiring locally, nationally, or for remote",
      "and international positions worldwide.",
    ],
    iconSrc: `${HIRE_ICONS_BASE}/Group 65.svg`,
  },
  {
    id: "availability-search",
    title: "Availability Search",
    descriptionLines: [
      "Filter candidates by when they can start, from available-now to specific",
      "contract types, so timing always matches your need.",
    ],
    iconSrc: `${HIRE_ICONS_BASE}/Path 94.svg`,
  },
  {
    id: "endorsement-search",
    title: "Endorsement Search",
    descriptionLines: [
      "Search by verified endorsements and references, finding candidates whose",
      "proven track record matches exactly what your role demands.",
    ],
    iconSrc: `${HIRE_ICONS_BASE}/Group 66.svg`,
  },
  {
    id: "trust-indicators",
    title: "Trust Indicators",
    descriptionLines: [
      "See verification badges at a glance, instantly confirming each candidate's",
      "identity, employment, and references are independently validated.",
    ],
    iconSrc: `${HIRE_ICONS_BASE}/Group 67.svg`,
  },
] as const;
