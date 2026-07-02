import type { ComponentType, SVGProps } from "react";

// import { FacebookIcon, InstagramIcon, LinkedInIcon } from "./SocialIcons";

export interface NavItemConfig {
  readonly label: string;
  readonly href: string;
  readonly variant?: "link" | "button";
  /** When true, the item is omitted from both desktop and mobile navigation. */
  readonly hidden?: boolean;
}

export function isActiveNavHref(itemHref: string, activeHref: string): boolean {
  if (itemHref === "/") return activeHref === "/";
  return activeHref === itemHref || activeHref.startsWith(`${itemHref}/`);
}

export interface SocialLinkConfig {
  readonly label: string;
  readonly href: string;
  readonly Icon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { label: "Home", href: "/", variant: "button" },
  { label: "Candidates", href: "/find-candidates" },
  { label: "Job Board", href: "/jobs" },
  { label: "Find Recruiters", href: "/find-recruiters" },
  { label: "Login", href: "/login" },
  { label: "Sign Up", href: "/signup" },
];

// export const SOCIAL_LINKS: SocialLinkConfig[] = [
//   { label: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
//   { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
//   { label: "LinkedIn", href: "https://linkedin.com", Icon: LinkedInIcon },
// ];
