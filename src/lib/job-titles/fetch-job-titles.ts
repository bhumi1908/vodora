import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import {
  createDataCache,
  LOOKUP_REVALIDATE_SECONDS,
} from "@/lib/cache/unstable-data-cache";
import { groupJobTitleOptions } from "@/lib/job-titles/group-job-title-options";
import type { JobTitleOptionGroup, JobTitleRecord } from "@/lib/job-titles/types";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type JobTitleRow = {
  id: string;
  name: string;
  sort_order: number;
  subcategory: {
    name: string;
    sort_order: number;
    category: {
      name: string;
      sort_order: number;
    };
  };
};

function mapJobTitleRow(row: JobTitleRow): JobTitleRecord {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    subcategoryName: row.subcategory.name,
    subcategorySortOrder: row.subcategory.sort_order,
    categoryName: row.subcategory.category.name,
    categorySortOrder: row.subcategory.category.sort_order,
  };
}

function sortJobTitleRecords(records: JobTitleRecord[]): JobTitleRecord[] {
  return [...records].sort((left, right) => {
    if (left.categorySortOrder !== right.categorySortOrder) {
      return left.categorySortOrder - right.categorySortOrder;
    }

    if (left.categoryName !== right.categoryName) {
      return left.categoryName.localeCompare(right.categoryName);
    }

    if (left.subcategorySortOrder !== right.subcategorySortOrder) {
      return left.subcategorySortOrder - right.subcategorySortOrder;
    }

    if (left.subcategoryName !== right.subcategoryName) {
      return left.subcategoryName.localeCompare(right.subcategoryName);
    }

    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.name.localeCompare(right.name);
  });
}

export async function fetchActiveJobTitles(
  supabase: Supabase,
): Promise<JobTitleRecord[]> {
  const { data, error } = await supabase
    .from("job_titles")
    .select(
      `
        id,
        name,
        sort_order,
        subcategory:job_subcategories!inner (
          name,
          sort_order,
          category:job_categories!inner (
            name,
            sort_order
          )
        )
      `,
    )
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  if (error) {
    throw error;
  }

  const records = sortJobTitleRecords(
    ((data ?? []) as JobTitleRow[]).map(mapJobTitleRow),
  );

  if (records.length === 0) {
    throw new Error("No active job titles found in database.");
  }

  return records;
}

export async function fetchJobTitleOptionGroups(
  supabase: Supabase,
): Promise<JobTitleOptionGroup[]> {
  const records = await fetchActiveJobTitles(supabase);
  return groupJobTitleOptions(records);
}

async function fetchPublicJobTitleOptionGroups(): Promise<JobTitleOptionGroup[]> {
  const supabase = createAdminClient();
  return fetchJobTitleOptionGroups(supabase);
}

const getCrossRequestJobTitleOptionGroups = createDataCache(
  fetchPublicJobTitleOptionGroups,
  ["lookup", "job-title-option-groups"],
  LOOKUP_REVALIDATE_SECONDS,
);

export const getCachedJobTitleOptionGroups = cache(
  getCrossRequestJobTitleOptionGroups,
);
