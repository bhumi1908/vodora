export interface FaqItemConfig {
  readonly id: string;
  readonly question: string;
  readonly subtitle: string;
  readonly answer: string;
}

export const FAQ_SECTION = {
  title: "Frequently Asked Questions",
  description:
    "Everything you need to know about building your verified profile, owning your references, and sharing your professional trust with confidence.",
} as const;

export const FAQ_ITEMS: readonly FaqItemConfig[] = [
  {
    id: "verify-references",
    question: "How does Vodora verify references?",
    subtitle: "Independently Validated",
    answer:
      "When you request a reference, we contact the referee through their corporate email and confirm their identity, job title, and working relationship to you. Each reference is independently validated before it appears on your profile, so recruiters can trust that every endorsement is genuine.",
  },
  {
    id: "free-for-candidates",
    question: "Is Vodora free for candidates?",
    subtitle: "",
    answer:
      "",
  },
  {
    id: "different-from-linkedin",
    question: "How is Vodora different from LinkedIn?",
    subtitle: "",
    answer:
      "",
  },
  {
    id: "control-visibility",
    question: "Can I control who sees my references?",
    subtitle: "",
    answer:
      "",
  },
  {
    id: "recruiter-pricing",
    question: "Do recruiters pay to use Vodora?",
    subtitle: "",
    answer:
      "",
  },
  {
    id: "reference-duration",
    question: "How long do references stay on my profile?",
    subtitle: "",
    answer:
      "",
  },
] as const;
