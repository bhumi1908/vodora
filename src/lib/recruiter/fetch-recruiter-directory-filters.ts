import type { SupabaseClient } from "@supabase/supabase-js";

import type { RecruiterDirectoryFilters } from "@/lib/recruiter/recruiter-directory.types";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type RpcFiltersResponse = {
  specialisations?: string[];
};

export async function fetchRecruiterDirectoryFilters(
  supabase: Supabase,
): Promise<RecruiterDirectoryFilters> {
  const { data, error } = await supabase.rpc("get_recruiter_directory_filters");

  if (error) {
    throw new Error(error.message);
  }

  const payload =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as RpcFiltersResponse)
      : null;

  const specialisations = Array.isArray(payload?.specialisations)
    ? payload.specialisations.filter(
        (value): value is string =>
          typeof value === "string" && value.trim().length > 0,
      )
    : [];

  return { specialisations };
}
