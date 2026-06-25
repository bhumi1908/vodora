import {
  createDataCache,
  FILTER_REVALIDATE_SECONDS,
} from "@/lib/cache/unstable-data-cache";
import type { RecruiterDirectoryFilters } from "@/lib/recruiter/recruiter-directory.types";
import { createAdminClient } from "@/lib/supabase/admin";

async function loadRecruiterSpecialisations(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("recruiters")
    .select("specialisations, users!inner(is_active)")
    .eq("users.is_active", true);

  if (error) {
    throw new Error(error.message);
  }

  const values = new Set<string>();

  for (const row of data ?? []) {
    const specialisations = row.specialisations ?? [];

    for (const value of specialisations) {
      const trimmed = value.trim();

      if (trimmed.length > 0) {
        values.add(trimmed);
      }
    }
  }

  return [...values].sort((left, right) => left.localeCompare(right));
}

const getCachedRecruiterSpecialisations = createDataCache(
  loadRecruiterSpecialisations,
  ["lookup", "recruiter-specialisations"],
  FILTER_REVALIDATE_SECONDS,
);

export async function fetchRecruiterDirectoryFilters(): Promise<RecruiterDirectoryFilters> {
  const specialisations = await getCachedRecruiterSpecialisations();

  return { specialisations };
}
