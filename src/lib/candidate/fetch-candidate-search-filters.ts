import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import type { CandidatePeerSearchFilters } from "@/lib/candidate/candidate-peer-search.types";
import {
  getCachedActiveIndustryCategories,
  getCachedActiveWorkTypes,
} from "@/lib/lookup/fetch-active-lookup-tables";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type SearchMetadata = {
  total_directory_count?: number;
  countries?: string[];
};

async function fetchCandidateSearchFilters(
  supabase: Supabase,
): Promise<CandidatePeerSearchFilters> {
  const [{ data: metadata }, categories, workTypes] = await Promise.all([
    supabase.rpc("get_candidate_search_metadata"),
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

export const getCachedCandidateSearchFilters = cache(fetchCandidateSearchFilters);
