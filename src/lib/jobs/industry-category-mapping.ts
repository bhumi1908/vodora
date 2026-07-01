import { JOB_POSTING_CATEGORIES } from "@/lib/jobs/job-board-options";

/** Maps industry category codes to job board category labels. */
const INDUSTRY_CODE_TO_JOB_CATEGORIES: Record<string, string[]> = {
  technology: ["Technology", "Product", "Design"],
  healthcare: ["Healthcare"],
  finance: ["Accounting & Finance"],
  engineering: ["Engineering"],
  education: ["Human Resources"],
  retail: ["Trades & Services"],
  manufacturing: ["Engineering", "Trades & Services"],
  construction: ["Trades & Services", "Engineering"],
  hospitality: ["Trades & Services"],
  government: ["Human Resources"],
  legal: ["Accounting & Finance"],
  marketing: ["Marketing", "Design"],
  other: JOB_POSTING_CATEGORIES as unknown as string[],
};

export function getJobCategoriesForIndustryCode(
  industryCode: string,
): string[] {
  const normalized = industryCode.trim().toLowerCase();
  return INDUSTRY_CODE_TO_JOB_CATEGORIES[normalized] ?? [];
}

export function getJobCategoriesForIndustryName(
  industryName: string,
): string[] {
  const normalized = industryName.trim().toLowerCase();

  if (normalized === "technology") {
    return getJobCategoriesForIndustryCode("technology");
  }

  if (normalized === "finance") {
    return getJobCategoriesForIndustryCode("finance");
  }

  const directMatch = JOB_POSTING_CATEGORIES.filter(
    (category) => category.toLowerCase() === normalized,
  );

  if (directMatch.length > 0) {
    return directMatch;
  }

  return JOB_POSTING_CATEGORIES.filter((category) =>
    category.toLowerCase().includes(normalized),
  );
}

export function resolveJobCategoriesForIndustry(
  industry: { id: string; code: string; name: string } | null | undefined,
): string[] {
  if (!industry) {
    return [];
  }

  const byCode = getJobCategoriesForIndustryCode(industry.code);

  if (byCode.length > 0) {
    return byCode;
  }

  return getJobCategoriesForIndustryName(industry.name);
}
