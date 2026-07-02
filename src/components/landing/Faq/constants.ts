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
    subtitle: "Completely Free for Candidates",
    answer:
      "Yes — creating a professional profile and collecting verified references on Vodora is completely free for candidates. There are no hidden fees, no paywalls on your reputation, and no subscription required to keep your profile active. You own your data from day one and can use it throughout your career, forever.",
  },
  {
    id: "different-from-linkedin",
    question: "How is Vodora different from LinkedIn?",
    subtitle: "Trust Infrastructure, Not a Social Network",
    answer:
      "Vodora is professional trust infrastructure, not a social network. While LinkedIn is built around connections, content, and engagement, Vodora focuses on what actually matters in hiring: verified employment history, authenticated references, and a portable professional reputation you control. Your credibility is built on evidence and validation — not likes, posts, or unverified endorsements.",
  },
  {
    id: "control-visibility",
    question: "Can I control who sees my references?",
    subtitle: "Share on Your Terms",
    answer:
      "Absolutely. You have complete control over who can view your references and profile. Vodora is built on permission-based access — you decide when to share, with whom, and what they can see. Your professional reputation belongs to you, and it is never exposed by default. You share it only when and how you choose.",
  },
  {
    id: "recruiter-pricing",
    question: "Do recruiters pay to use Vodora?",
    subtitle: "Powerful Tools for Hiring Teams",
    answer:
      "Recruiters have access to a powerful suite of search and hiring tools designed to surface verified talent and authenticated references — not unverified claims. Vodora gives hiring teams advanced discovery, trust signals, and reference validation built into every profile. Contact us to learn about recruiter account options and pricing tailored to your team.",
  },
  {
    id: "reference-duration",
    question: "How long do references stay on my profile?",
    subtitle: "Forever Yours",
    answer:
      "Forever. Once a reference is verified and added to your Vodora profile, it stays with you throughout your career. There is no expiry date, no platform lock-in, and no risk of losing your endorsements when you change jobs. You own your professional reputation — and Vodora is built to preserve it for the long term.",
  },
] as const;
