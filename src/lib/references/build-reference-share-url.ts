export function buildReferenceShareUrl(shareToken: string, origin?: string): string {
  const base = origin?.replace(/\/$/, "") ?? "";

  if (base) {
    return `${base}/share/${shareToken}`;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/share/${shareToken}`;
  }

  return `/share/${shareToken}`;
}
