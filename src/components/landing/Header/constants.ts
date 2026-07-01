import type { ComponentType, SVGProps } from "react";

import { FacebookIcon, InstagramIcon, LinkedInIcon } from "./SocialIcons";

export interface NavItemConfig {
  readonly label: string;
  readonly href: string;
}

export interface SocialLinkConfig {
  readonly label: string;
  readonly href: string;
  readonly Icon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { label: "Home", href: "/" },
  { label: "Candidates", href: "/find-candidates" },
  { label: "Job Board", href: "/jobs" },
  { label: "Find Recruiters", href: "/find-recruiters" },
  { label: "Login", href: "/login" },
];

export const SOCIAL_LINKS: SocialLinkConfig[] = [
  { label: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: LinkedInIcon },
];
