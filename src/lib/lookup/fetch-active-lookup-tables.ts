import { createAdminClient } from "@/lib/supabase/admin";
import {
  createDataCache,
  LOOKUP_REVALIDATE_SECONDS,
} from "@/lib/cache/unstable-data-cache";

export type LookupCategory = {
  id: string;
  name: string;
};

export type LookupWorkType = {
  code: string;
  name: string;
};

async function loadActiveIndustryCategories(): Promise<LookupCategory[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("industry_categories")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function loadActiveWorkTypes(): Promise<LookupWorkType[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("work_types")
    .select("code, name")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export const getCachedActiveIndustryCategories = createDataCache(
  loadActiveIndustryCategories,
  ["lookup", "industry-categories"],
  LOOKUP_REVALIDATE_SECONDS,
);

export const getCachedActiveWorkTypes = createDataCache(
  loadActiveWorkTypes,
  ["lookup", "work-types"],
  LOOKUP_REVALIDATE_SECONDS,
);
