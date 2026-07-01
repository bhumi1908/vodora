export interface WorkStepItem {
  readonly id: string;
  readonly iconSrc: string;
  readonly title: string;
  readonly description: string;
  readonly buttonHref: string;
  readonly buttonAriaLabel: string;
}

export const HOW_IT_WORKS = {
  title: "How Vodora Works",
  imageSrc: "/Images/workImage.png",
  imageAlt: "Vodora vertical brand graphic",
  imageWidth: 171,
  imageHeight: 1093,
  separatorCount: 6,
} as const;

export const WORK_STEPS: readonly WorkStepItem[] = [
  {
    id: "create-profile",
    iconSrc: "/Images/howItWorks/Group 41.svg",
    title: "Create Profile",
    description:
      "Sign up in minutes and build a complete professional profile, adding your skills, experience, and career details to one secure, verified place you fully control.",
    buttonHref: "/signup/candidate",
    buttonAriaLabel: "Go to create profile",
  },
  {
    id: "add-employment-history",
    iconSrc: "/Images/howItWorks/Group 42.svg",
    title: "Add Employment History",
    description:
      "Document every role you've held to build a complete, accurate record of your work experience that recruiters can genuinely trust, with nothing left unverified or unclear.",
    buttonHref: "/signup/candidate",
    buttonAriaLabel: "Go to add employment history",
  },
  {
    id: "request-verified-references",
    iconSrc: "/Images/howItWorks/Group 43.svg",
    title: "Request Verified References",
    description:
      "Invite former managers to provide references, which we independently validate through corporate email and relationship checks, so every endorsement on your profile carries real, confirmed weight.",
    buttonHref: "/signup/candidate",
    buttonAriaLabel: "Go to request verified references",
  },
  {
    id: "build-trust-profile",
    iconSrc: "/Images/howItWorks/Group 51.svg",
    title: "Build Your Trust Profile",
    description:
      "Accumulate verifications over time and steadily strengthen your professional credibility, standing out from candidates who rely only on unproven, self-reported claims with nothing backing them up.",
    buttonHref: "/signup/candidate",
    buttonAriaLabel: "Go to build trust profile",
  },
  {
    id: "share-anywhere",
    iconSrc: "/Images/howItWorks/Group 52.svg",
    title: "Share Anywhere Instantly",
    description:
      "Send your complete verified profile to any recruiter or employer with a single click, skipping repeated paperwork and the endless back-and-forth of traditional reference checks.",
    buttonHref: "/signup/candidate",
    buttonAriaLabel: "Go to share anywhere",
  },
  {
    id: "get-hired",
    iconSrc: "/Images/howItWorks/Group 54.svg",
    title: "Get Hired Faster",
    description:
      "Recruiters trust your verified references the moment they see them, moving you through the hiring process far quicker than candidates still starting their checks from scratch.",
    buttonHref: "/signup/candidate",
    buttonAriaLabel: "Go to get hired",
  }

] as const;
