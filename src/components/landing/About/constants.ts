export interface StatItem {
  readonly value: string;
  readonly label: string;
}

export interface AboutContentConfig {
  readonly label: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly buttonText: string;
  readonly buttonHref: string;
}

export interface AboutImageCardConfig {
  readonly image: string;
  readonly title: string;
  readonly description: string;
}

export const ABOUT_CONTENT: AboutContentConfig = {
  label: "About Vodora",
  heading: "We turn your scattered references into one verified profile you own for life.",
  paragraphs: [
    "No more rebuilding trust from scratch every time you apply for a job. No more digging up old contact details, chasing the same former managers, and asking them to vouch for you all over again.",
    "With Vodora, you collect your references once, we verify them properly, and they stay with you permanently — ready to share with any recruiter, for any role, at any point in your career.",
  ],
  buttonText: "Create Profile Today",
  buttonHref: "/signup/candidate",
} as const;

export const ABOUT_STATS: readonly StatItem[] = [
  { value: "10,000+", label: "References Verified" },
  { value: "500+", label: "Trusted by 500+ Recruiters" },
] as const;

export const ABOUT_IMAGE_CARD: AboutImageCardConfig = {
  image: "/Images/about-us.png",
  title: "Own Your Reputation",
  description:
    "One verified profile that carries your trusted references and proven history wherever your career takes you.",
} as const;
