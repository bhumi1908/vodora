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
    id: "contract",
    title: "Contract",
    description: "Begin each contract with verification already in place.",
    imageSrc: `${WORK_STYLE_IMAGES_BASE}/Group 100.png`,
    imageWidth: 204,
    imageHeight: 385,
    imageAlt: "Professional working on a laptop in a bright workspace",
  },
  {
    id: "freelance",
    title: "Freelance",
    description: "Move between projects without rebuilding your reputation.",
    imageSrc: `${WORK_STYLE_IMAGES_BASE}/Group 92.png`,
    imageWidth: 375,
    imageHeight: 385,
    imageAlt: "Professional working at a desk in a modern office",
  },
  {
    id: "casual",
    title: "Casual",
    description: "Take on flexible work with references that travel with you.",
    imageSrc: `${WORK_STYLE_IMAGES_BASE}/Group 96.png`,
    imageWidth: 375,
    imageHeight: 385,
    imageAlt: "Person writing notes at a workspace with a plant",
  },
] as const;
