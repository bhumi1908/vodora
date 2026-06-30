import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import type { CandidatePeerSearchFilters } from "@/lib/candidate/candidate-peer-search.types";
import {
  getCachedActiveIndustryCategories,
  getCachedActiveWorkTypes,
} from "@/lib/lookup/fetch-active-lookup-tables";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type SearchCategory = {
  id: string;
  name: string;
};

type SearchMetadata = {
  total_directory_count?: number;
  countries?: string[];
  categories?: SearchCategory[];
};

function normalizeCategories(
  value: unknown,
): SearchCategory[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (
      entry &&
      typeof entry === "object" &&
      "id" in entry &&
      "name" in entry &&
      typeof entry.id === "string" &&
      typeof entry.name === "string"
    ) {
      return [{ id: entry.id, name: entry.name }];
    }

    return [];
  });
}

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

  const metadataCategories = normalizeCategories(meta?.categories);

  return {
    categories:
      metadataCategories.length > 0 ? metadataCategories : (categories ?? []),
    workTypes: workTypes ?? [],
    countries: Array.isArray(meta?.countries) ? meta.countries : [],
    totalDirectoryCount: meta?.total_directory_count ?? 0,
  };
}

export const getCachedCandidateSearchFilters = cache(fetchCandidateSearchFilters);
