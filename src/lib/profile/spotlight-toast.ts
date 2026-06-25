import { toast } from "sonner";

import { SPOTLIGHT_BLOCK_TYPES } from "@/components/profile/spotlight/constants";
import type { SpotlightBlockType } from "@/lib/profile/spotlight.types";

function getSpotlightBlockLabel(type: SpotlightBlockType): string {
  return (
    SPOTLIGHT_BLOCK_TYPES.find((entry) => entry.id === type)?.label ??
    "Spotlight block"
  );
}

export function showSpotlightBlockAddedToast(type: SpotlightBlockType) {
  toast.success(`${getSpotlightBlockLabel(type)} added successfully.`);
}

export function showSpotlightBlockUpdatedToast(type: SpotlightBlockType) {
  toast.success(`${getSpotlightBlockLabel(type)} saved successfully.`);
}

export function showSpotlightBlockDeletedToast(type?: SpotlightBlockType) {
  const label = type ? getSpotlightBlockLabel(type) : "Spotlight block";
  toast.success(`${label} removed successfully.`);
}

export function showSpotlightSaveErrorToast(message?: string) {
  toast.error(
    message?.trim() || "Could not save spotlight block. Please try again.",
  );
}
