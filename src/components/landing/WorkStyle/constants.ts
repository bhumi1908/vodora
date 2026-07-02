export interface WorkStyleCardConfig {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly imageSrc: string;
  readonly imageWidth: number;
  readonly imageHeight: number;
  readonly imageAlt: string;
}

const WORK_STYLE_IMAGES_BASE = "/Images/WorkStyle";

export const WORK_STYLE_CARD = {
  textMinHeight: "min-h-[128px]"  ,
} as const;

export const WORK_STYLE_SECTION = {
  titleLine1: "One Profile.",
  titleLine2: "Every Work Style.",
  description:
    "Whether you're permanent, freelance, contract, or casual, local or remote, one verified profile carries your trusted references across every kind of work.",
} as const;

export const WORK_STYLE_CARDS: readonly WorkStyleCardConfig[] = [
  {
    id: "full-time",
    title: "Full Time",
    description: "One verified profile for every permanent role.",
    imageSrc: `${WORK_STYLE_IMAGES_BASE}/Group 92.png`,
    imageWidth: 375,
    imageHeight: 385,
    imageAlt: "Professional working at a desk in a modern office",
  },
  {
    id: "part-time",
    title: "Part Time",
    description: "Carry trusted references between every part-time position.",
    imageSrc: `${WORK_STYLE_IMAGES_BASE}/Group 96.png`,
    imageWidth: 375,
    imageHeight: 385,
    imageAlt: "Person writing notes at a workspace with a plant",
  },
  {
    id: "freelance",
    title: "Freelance",
    description: "Win clients faster with proven reputation built in.",
    imageSrc: `${WORK_STYLE_IMAGES_BASE}/Group_8.png`,
    imageWidth: 375,
    imageHeight: 385,
    imageAlt: "Freelancer working on a laptop at a desk",
  },
  {
    id: "labour-hire",
    title: "Labour Hire",
    description: "Your verified history follows you between placements.",
    imageSrc: `${WORK_STYLE_IMAGES_BASE}/Group_9.png`,
    imageWidth: 375,
    imageHeight: 385,
    imageAlt: "Professional working at a desk in a modern office",
  },
  {
    id: "casual",
    title: "Casual",
    description: "Keep references ready for every casual shift.",
    imageSrc: `${WORK_STYLE_IMAGES_BASE}/Group_10.png`,
    imageWidth: 375,
    imageHeight: 385,
    imageAlt: "Smiling professional at a desk with a laptop",
  },
  {
    id: "remote",
    title: "Remote",
    description: "Prove your credibility to employers anywhere instantly.",
    imageSrc: `${WORK_STYLE_IMAGES_BASE}/Group_11.png`,
    imageWidth: 375,
    imageHeight: 385,
    imageAlt: "Remote worker at a desk in a bright office with large windows",
  },
  {
    id: "fifo",
    title: "FIFO",
    description: "Your verified profile travels to every rotation.",
    imageSrc: `${WORK_STYLE_IMAGES_BASE}/Group_12.png`,
    imageWidth: 375,
    imageHeight: 385,
    imageAlt: "Hands typing on a laptop keyboard from above",
  },
  {
    id: "temporary",
    title: "Temporary",
    description: "Arrive at temp roles already trusted and verified.",
    imageSrc: `${WORK_STYLE_IMAGES_BASE}/Group_13.png`,
    imageWidth: 375,
    imageHeight: 385,
    imageAlt: "Professional reviewing documents at a desk with a laptop",
  },
] as const;
