import type { ProfileTabId } from "@/lib/profile/profile-visibility";

export function parseProfileTab(value: string | null): ProfileTabId | null {
  if (value === "references" || value === "documents" || value === "jobs") {
    return value;
  }

  return null;
}

export function resolveProfileTabFromUrl(
  tabParam: string | null,
  visibleTabIds: ProfileTabId[],
): ProfileTabId {
  const parsed = parseProfileTab(tabParam);

  if (parsed && visibleTabIds.includes(parsed)) {
    return parsed;
  }

  return visibleTabIds[0] ?? "references";
}
