import type { ResolvedJobTitle } from "@/lib/job-titles/types";
import { createAdminClient } from "@/lib/supabase/admin";

type JobTitleLookupRow = {
  id: string;
  name: string;
  subcategory: {
    category: {
      industry_category_id: string | null;
    };
  };
};

export async function resolveJobTitleForSignup(
  jobTitleId: string,
): Promise<{ jobTitle: ResolvedJobTitle | null; error: string | null }> {
  const normalizedId = jobTitleId.trim();

  if (!normalizedId) {
    return { jobTitle: null, error: "Job title is required." };
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("job_titles")
    .select(
      `
        id,
        name,
        subcategory:job_subcategories!inner (
          category:job_categories!inner (
            industry_category_id
          )
        )
      `,
    )
    .eq("id", normalizedId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    return {
      jobTitle: null,
      error: "Unable to look up job titles. Please try again or contact support.",
    };
  }

  if (!data) {
    return { jobTitle: null, error: "Please select a valid job title." };
  }

  const row = data as JobTitleLookupRow;

  return {
    jobTitle: {
      id: row.id,
      name: row.name,
      industryCategoryId: row.subcategory.category.industry_category_id,
    },
    error: null,
  };
}
