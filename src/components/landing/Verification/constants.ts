export interface VerificationCheckItem {
  readonly label: string;
}

export interface VerificationCardConfig {
  readonly id: string;
  readonly imageSrc: string;
  readonly imageWidth: number;
  readonly imageHeight: number;
  readonly imageAlt: string;
  readonly heading: string;
  readonly description: string;
  readonly checks: readonly VerificationCheckItem[];
  readonly buttonText: string;
  readonly buttonHref: string;
}

export const VERIFICATION_SECTION = {
  title: "Multi-Layer Verification",
  subtitle:
    "Trust is confirmed from every angle, so candidates, references, and recruiters are all independently verified before a single profile is ever shared.",
} as const;

export const VERIFICATION_CARDS: readonly VerificationCardConfig[] = [
  {
    id: "candidate-verification",
    imageSrc: "/Images/Verification-1.png",
    imageWidth: 620,
    imageHeight: 405,
    imageAlt: "Candidates working together at a desk",
    heading: "We Confirm Every Candidate Is Real",
    description:
      "Email, identity, and employment history independently verified for each person.",
    checks: [
      { label: "Email Verified" },
      { label: "Identity Verified" },
      { label: "Employment Verified" },
    ],
    buttonText: "Create Profile Today",
    buttonHref: "/signup/candidate",
  },
  {
    id: "reference-verification",
    imageSrc: "/Images/Verification-2.png",
    imageWidth: 620,
    imageHeight: 405,
    imageAlt: "Office workspace",
    heading: "Reference Verification",
    description: "",
    checks: [],
    buttonText: "",
    buttonHref: "#",
  },
] as const;
