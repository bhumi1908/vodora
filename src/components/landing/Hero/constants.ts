export interface WorkflowStep {
  readonly id: string;
  readonly title: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: "request", title: "Candidate requests a reference" },
  { id: "provide", title: "Manager Provides a reference" },
  { id: "verify", title: "Vodora verifies and stores it" },
  { id: "share", title: "Candidate shares with recruiter" },
  { id: "hired", title: "Gets hired" },
];

export const HERO_CONTENT = {
  headlineLines: ["Build the profile", "that works for you"],
  description:
    "Get hired faster with a verified professional profile that stores your references, employment history, skills, and achievements in one place.",
  primaryCta: {
    text: "Create Profile Today",
    href: "/signup/candidate",
  },
  secondaryCta: {
    text: "Login as a Recruiter",
    href: "/login",
  },
  socialProof: "Our users love the experience with Vodora",
} as const;

export const AVATAR_IMAGES = [
  "/Images/user-1.png",
  "/Images/user-2.png",
  "/Images/user-3.png",
  "/Images/user-4.png",
] as const;
