import type { SupabaseClient } from "@supabase/supabase-js";

function slugifyIndustryInput(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "_");
}

export async function resolveIndustryCategoryId(
  supabase: SupabaseClient,
  industryInput: string,
): Promise<{ id: string | null; error: string | null }> {
  const normalized = industryInput.trim();

  if (!normalized) {
    return { id: null, error: "Industry is required." };
  }

  const { data: byName, error: nameError } = await supabase
    .from("industry_categories")
    .select("id")
    .ilike("name", normalized)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (nameError) {
    return {
      id: null,
      error:
        "Unable to look up industry categories. Please try again or contact support.",
    };
  }

  if (byName?.id) {
    return { id: byName.id, error: null };
  }

  const code = slugifyIndustryInput(normalized);

  const { data: byCode, error: codeError } = await supabase
    .from("industry_categories")
    .select("id")
    .eq("code", code)
    .eq("is_active", true)
    .maybeSingle();

  if (codeError) {
    return {
      id: null,
      error:
        "Unable to look up industry categories. Please try again or contact support.",
    };
  }

  if (byCode?.id) {
    return { id: byCode.id, error: null };
  }

  const { data: byPartial, error: partialError } = await supabase
    .from("industry_categories")
    .select("id")
    .ilike("name", `%${normalized}%`)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (partialError) {
    return {
      id: null,
      error:
        "Unable to look up industry categories. Please try again or contact support.",
    };
  }

  if (byPartial?.id) {
    return { id: byPartial.id, error: null };
  }

  const { data: other, error: otherError } = await supabase
    .from("industry_categories")
    .select("id")
    .eq("code", "other")
    .eq("is_active", true)
    .maybeSingle();

  if (otherError || !other?.id) {
    return {
      id: null,
      error:
        "Unable to look up industry categories. Please try again or contact support.",
    };
  }

  return { id: other.id, error: null };
}
