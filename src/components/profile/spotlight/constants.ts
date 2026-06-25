import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  Code2,
  Flame,
  Quote,
  Trophy,
  Video,
} from "lucide-react";

import type { SpotlightBlockType } from "@/lib/profile/spotlight.types";

export type SpotlightBlockTypeConfig = {
  id: SpotlightBlockType;
  label: string;
  desc: string;
  icon: LucideIcon;
  color: string;
};

export const SPOTLIGHT_BLOCK_TYPES: SpotlightBlockTypeConfig[] = [
  {
    id: "bio",
    label: "Bio / Story",
    desc: "Tell people who you really are",
    icon: AlignLeft,
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    id: "achievement",
    label: "Standout Achievement",
    desc: "Highlight something you're proud of",
    icon: Trophy,
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    id: "quote",
    label: "Personal Quote",
    desc: "A short motto shown in your profile header",
    icon: Quote,
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    id: "passions",
    label: "Passions & Interests",
    desc: "What lights you up outside work",
    icon: Flame,
    color: "bg-rose-50 text-rose-500 border-rose-200",
  },
  {
    id: "code",
    label: "Code Snippet",
    desc: "Show off your coding style",
    icon: Code2,
    color: "bg-gray-50 text-gray-700 border-gray-200",
  },
  {
    id: "video",
    label: "Video Introduction",
    desc: "Let your personality shine through",
    icon: Video,
    color: "bg-green-50 text-green-600 border-green-200",
  },
];

export const SPOTLIGHT_CODE_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Go",
  "Rust",
  "SQL",
  "Bash",
  "CSS",
  "HTML",
  "Java",
] as const;
