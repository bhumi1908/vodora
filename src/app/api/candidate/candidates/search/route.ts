import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { searchCandidatesForCandidates } from "@/lib/candidate/fetch-candidate-peer-search";
import type { CandidatePeerSearchParams } from "@/lib/candidate/candidate-peer-search.types";
import { resolveCategorySearchParam } from "@/lib/search/resolve-category-search-param";
import { createClient } from "@/lib/supabase/server";

function parseExperienceRange(value: string | null): {
  experienceMin?: number;
  experienceMax?: number;
} {
  switch (value) {
    case "0-3 years":
      return { experienceMin: 0, experienceMax: 3 };
    case "4-7 years":
      return { experienceMin: 4, experienceMax: 7 };
    case "8+ years":
      return { experienceMin: 8 };
    default:
      return {};
  }
}

function parseMinReferences(value: string | null): number | undefined {
  switch (value) {
    case "5+ references":
      return 5;
    case "8+ references":
      return 8;
    case "10+ references":
      return 10;
    default:
      return undefined;
  }
}

function parseSearchParams(url: URL): Omit<CandidatePeerSearchParams, "categoryId"> & {
  categoryId?: string;
  legacyCategory?: string;
} {
  const workTypeCodes = url.searchParams
    .getAll("workType")
    .map((code) => code.trim())
    .filter(Boolean);

  const experience = parseExperienceRange(
    url.searchParams.get("experience"),
  );

  return {
    query: url.searchParams.get("q") ?? undefined,
    categoryId: url.searchParams.get("categoryId") ?? undefined,
    legacyCategory: url.searchParams.get("category") ?? undefined,
    availabilityStart:
      url.searchParams.get("availability") &&
      url.searchParams.get("availability") !== "All"
        ? (url.searchParams.get("availability") ?? undefined)
        : undefined,
    workTypeCodes: workTypeCodes.length > 0 ? workTypeCodes : undefined,
    country: url.searchParams.get("country") ?? undefined,
    minReferences: parseMinReferences(url.searchParams.get("references")),
    page: Number(url.searchParams.get("page") ?? "1"),
    limit: Number(url.searchParams.get("limit") ?? "10"),
    ...experience,
  };
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  const accountType = await getAccountType(supabase, user);

  if (accountType !== "candidate") {
    return NextResponse.json(
      { success: false, error: "Candidate access required." },
      { status: 403 },
    );
  }

  const parsedParams = parseSearchParams(new URL(request.url));
  const { legacyCategory, ...searchInput } = parsedParams;
  const categoryId = await resolveCategorySearchParam(
    supabase,
    parsedParams.categoryId,
    legacyCategory,
  );
  const params: CandidatePeerSearchParams = {
    ...searchInput,
    categoryId,
  };
  const result = await searchCandidatesForCandidates(supabase, params);

  if (result.error) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    ...result,
  });
}
