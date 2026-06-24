export const referenceKeys = {
  all: ["candidate-references"] as const,
  list: () => [...referenceKeys.all, "list"] as const,
  recruiter: (vodoraId: string) =>
    [...referenceKeys.all, "recruiter", vodoraId] as const,
  shares: () => [...referenceKeys.all, "shares"] as const,
  grants: () => [...referenceKeys.all, "grants"] as const,
  shareLink: (token: string) =>
    [...referenceKeys.all, "share-link", token] as const,
};
