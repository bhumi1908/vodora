export const REFERENCE_BADGE_COLOR: Record<string, string> = {
  Outstanding: "bg-green-100 text-green-800",
  "Above Expectations": "bg-blue-100 text-blue-800",
  "Meets Expectations": "bg-gray-100 text-gray-700",
  "Extremely Reliable": "bg-green-100 text-green-800",
  "Very Reliable": "bg-blue-100 text-blue-800",
  Exceptional: "bg-green-100 text-green-800",
  Excellent: "bg-green-100 text-green-800",
  "Very Good": "bg-blue-100 text-blue-800",
  "Exceptional Team Player": "bg-green-100 text-green-800",
  "Strong Team Player": "bg-blue-100 text-blue-800",
  "Exceptional Fit": "bg-green-100 text-green-800",
  "Strong Fit": "bg-blue-100 text-blue-800",
  "Expert Level": "bg-green-100 text-green-800",
  Advanced: "bg-blue-100 text-blue-800",
  "Exceptional Initiative": "bg-green-100 text-green-800",
  "Outstanding Leader": "bg-green-100 text-green-800",
  "Strong Leadership Potential": "bg-blue-100 text-blue-800",
  "Without Hesitation": "bg-green-100 text-green-800",
  Yes: "bg-blue-100 text-blue-800",
  "Unable to Assess": "bg-gray-100 text-gray-500",
};

export function referenceBadgeClass(value: string): string {
  return REFERENCE_BADGE_COLOR[value] ?? "bg-gray-100 text-gray-700";
}

export function formatReferenceId(responseId: string): string {
  return `VDR-REF-${responseId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}
