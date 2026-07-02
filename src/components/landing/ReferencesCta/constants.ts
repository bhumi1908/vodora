
interface WorkflowStep {
  readonly id: string;
  readonly title: string;
  readonly subTitle: string;
}
export const REFERENCES_CTA_SECTION = {
  title: "References Verified Once. Used Forever.",
  descriptionLines: [
    "Collect and verify your references a single time, then reuse them across every",
    "application for life.",
  ],
  cta: {
    text: "Create Profile Today",
    href: "/signup/candidate",
  },
} as const;
        
export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: "request", title: "Manager",subTitle: "Provides a reference" },
  { id: "provide", title: " Verification" ,subTitle: "Vodora Validates"},
  { id: "verify", title: "Trust Record",subTitle:"Stored Forever" },
  { id: "share", title: "Multiple Recruiters" ,subTitle:"Share Instantly"},
];


export const REFERENCES_CTA_BG = "/Images/ReputationBG.png" as const;
