import type { SupabaseClient } from "@supabase/supabase-js";

import { resolveIndustryCategoryId } from "@/lib/auth/industry";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export async function resolveCategorySearchParam(
  supabase: SupabaseClient,
  categoryId: string | null | undefined,
  legacyCategory: string | null | undefined,
): Promise<string | undefined> {
  const trimmedCategoryId = categoryId?.trim();

  if (trimmedCategoryId && isUuid(trimmedCategoryId)) {
    return trimmedCategoryId;
  }

  const legacyValue = legacyCategory?.trim();

  if (!legacyValue || legacyValue === "All") {
    return undefined;
  }

  const { id } = await resolveIndustryCategoryId(supabase, legacyValue);

  return id ?? undefined;
}
