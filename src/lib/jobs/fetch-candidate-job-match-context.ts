import type { SupabaseClient } from "@supabase/supabase-js";

import { resolveJobCategoriesForIndustry } from "@/lib/jobs/industry-category-mapping";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export type CandidateJobMatchContext = {
  industryCategoryId: string | null;
  industryCode: string | null;
  industryName: string | null;
  location: string;
  skillNames: string[];
};

function inferLocationFromCountry(country: string | null | undefined): string {
  if (!country?.trim()) {
    return "All Locations";
  }

  const normalized = country.trim().toLowerCase();

  if (normalized.includes("australia")) {
    return "Australia";
  }

  if (normalized === "uk" || normalized.includes("united kingdom")) {
    return "UK";
  }

  if (normalized.includes("canada")) {
    return "Canada";
  }

  return "All Locations";
}

export async function fetchCandidateViewerLocation(
  supabase: Supabase,
  userId: string,
): Promise<{ city: string | null; country: string | null } | null> {
  const { data: candidate, error } = await supabase
    .from("candidates")
    .select("city, country")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !candidate) {
    return null;
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("city, country")
    .eq("id", userId)
    .maybeSingle();

  return {
    city: candidate.city ?? userRow?.city ?? null,
    country: candidate.country ?? userRow?.country ?? null,
  };
}

export async function fetchCandidateJobMatchContext(
  supabase: Supabase,
  userId: string,
): Promise<CandidateJobMatchContext | null> {
  const { data: candidate, error } = await supabase
    .from("candidates")
    .select("id, city, country, industry_category_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !candidate) {
    return null;
  }

  const [{ data: userRow }, { data: skills }, industry] = await Promise.all([
    supabase
      .from("users")
      .select("city, country")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("candidate_skills")
      .select("skill_name")
      .eq("candidate_id", candidate.id)
      .order("skill_name")
      .limit(5),
    candidate.industry_category_id
      ? resolveIndustryCategoryById(supabase, candidate.industry_category_id)
      : Promise.resolve(null),
  ]);

  const country = candidate.country ?? userRow?.country ?? null;

  return {
    industryCategoryId: candidate.industry_category_id,
    industryCode: industry?.code ?? null,
    industryName: industry?.name ?? null,
    location: inferLocationFromCountry(country),
    skillNames: (skills ?? []).map((skill) => skill.skill_name),
  };
}

export async function resolveIndustryCategoryById(
  supabase: Supabase,
  industryCategoryId: string,
): Promise<{ id: string; code: string; name: string } | null> {
  const { data, error } = await supabase
    .from("industry_categories")
    .select("id, code, name")
    .eq("id", industryCategoryId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function resolveJobCategoriesForIndustryId(
  supabase: Supabase,
  industryCategoryId: string,
): Promise<string[]> {
  const industry = await resolveIndustryCategoryById(supabase, industryCategoryId);

  return resolveJobCategoriesForIndustry(industry);
}

export function buildProfileMatchQuery(
  context: CandidateJobMatchContext,
): string {
  return context.skillNames.slice(0, 3).join(" ").trim();
}

export function buildProfileMatchFilters(context: CandidateJobMatchContext): {
  industryCategoryId: string | null;
  location: string;
  query: string;
} {
  return {
    industryCategoryId: context.industryCategoryId,
    location: context.location,
    query: buildProfileMatchQuery(context),
  };
}
