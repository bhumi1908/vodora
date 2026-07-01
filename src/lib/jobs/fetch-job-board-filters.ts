import { getCachedActiveIndustryCategories } from "@/lib/lookup/fetch-active-lookup-tables";

export type JobBoardFilters = {
  industries: Array<{ id: string; name: string }>;
};

export async function fetchJobBoardFilters(): Promise<JobBoardFilters> {
  const industries = await getCachedActiveIndustryCategories();

  return {
    industries,
  };
}
