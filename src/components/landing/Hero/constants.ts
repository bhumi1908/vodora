


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

interface HeroWorkflowStep {
  readonly id: string;
  readonly title: string;
  readonly subTitle: string;
}

export const HERO_WORKFLOW_STEPS: HeroWorkflowStep[] = [
  { id: "request", title: "Candidate Requests", subTitle: "A Reference" },
  { id: "provide", title: "Manager Provides", subTitle: "The Reference" },
  { id: "verify", title: "Vodora Verifies", subTitle: "And Stores It" },
  { id: "share", title: "Candidate Shares", subTitle: "With Recruiters" },
  { id: "hired", title: "Candidate Gets", subTitle: "Hired Faster" },
];
