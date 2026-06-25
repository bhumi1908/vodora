import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import {
  getCachedActiveIndustryCategories,
  getCachedActiveWorkTypes,
} from "@/lib/lookup/fetch-active-lookup-tables";
import type { RecruiterSearchFilters } from "@/lib/recruiter/search.types";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type SearchMetadata = {
  total_directory_count?: number;
  countries?: string[];
};

async function fetchRecruiterSearchFilters(
  supabase: Supabase,
): Promise<RecruiterSearchFilters> {
  const [{ data: metadata }, categories, workTypes] = await Promise.all([
    supabase.rpc("get_recruiter_search_metadata"),
    getCachedActiveIndustryCategories(),
    getCachedActiveWorkTypes(),
  ]);

  const meta =
    metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? (metadata as SearchMetadata)
      : null;

  return {
    categories: categories ?? [],
    workTypes: workTypes ?? [],
    countries: Array.isArray(meta?.countries) ? meta.countries : [],
    totalDirectoryCount: meta?.total_directory_count ?? 0,
  };
}

export const getCachedRecruiterSearchFilters = cache(fetchRecruiterSearchFilters);
