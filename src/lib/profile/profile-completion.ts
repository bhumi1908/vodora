import type { SpotlightBlock } from "@/lib/profile/spotlight.types";
import { dedupeSingletonSpotlightBlocks } from "@/lib/profile/spotlight";
import type { CandidateProfileData } from "@/lib/profile/types";

export type ProfileCompletionItem = {
  label: string;
  done: boolean;
  weight: number;
};

export function computeProfileCompletion(
  profile: CandidateProfileData,
  options?: { verifiedReferenceCount?: number },
): { items: ProfileCompletionItem[]; percent: number } {
  const spotlight = profile.spotlightBlocks;
  const hasBio =
    Boolean(profile.about?.trim()) ||
    spotlight.some((block) => block.type === "bio" && block.text?.trim());
  const hasAchievement = spotlight.some(
    (block) => block.type === "achievement" && block.title?.trim(),
  );
  const hasPassions = spotlight.some(
    (block) => block.type === "passions" && (block.tags?.length ?? 0) > 0,
  );

  const items: ProfileCompletionItem[] = [
    {
      label: "Profile photo",
      done: Boolean(profile.profilePictureUrl),
      weight: 15,
    },
    {
      label: "Job title",
      done: Boolean(profile.title?.trim()),
      weight: 10,
    },
    {
      label: "Current company",
      done: Boolean(profile.company?.trim()),
      weight: 10,
    },
    {
      label: "Location",
      done: Boolean(profile.location?.trim()),
      weight: 10,
    },
    { label: "Bio / story", done: hasBio, weight: 10 },
    {
      label: "Standout achievement",
      done: hasAchievement,
      weight: 10,
    },
    {
      label: "Work experience",
      done: profile.experience.length > 0,
      weight: 10,
    },
    {
      label: "Education",
      done: profile.education.length > 0,
      weight: 5,
    },
    {
      label: "Skills",
      done: profile.skills.length > 0,
      weight: 5,
    },
    { label: "Passions & interests", done: hasPassions, weight: 5 },
    {
      label: "At least 1 reference",
      done: (options?.verifiedReferenceCount ?? 0) > 0,
      weight: 10,
    },
  ];

  const total = items.reduce((sum, item) => sum + item.weight, 0);
  const earned = items
    .filter((item) => item.done)
    .reduce((sum, item) => sum + item.weight, 0);
  const percent = total > 0 ? Math.round((earned / total) * 100) : 0;

  return { items, percent };
}

export function partitionSpotlightBlocks(blocks: SpotlightBlock[]) {
  const normalized = dedupeSingletonSpotlightBlocks(blocks);
  const quoteBlock = normalized.find((block) => block.type === "quote") ?? null;
  const passionsBlocks = normalized.filter((block) => block.type === "passions");
  const spotlightBlocks = normalized.filter(
    (block) => block.type !== "quote" && block.type !== "passions",
  );

  return { quoteBlock, passionsBlocks, spotlightBlocks };
}
