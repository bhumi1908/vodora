export const referenceKeys = {
  all: ["candidate-references"] as const,
  list: () => [...referenceKeys.all, "list"] as const,
};
