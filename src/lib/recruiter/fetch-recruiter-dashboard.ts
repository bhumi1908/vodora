import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import type {
  RecruiterDashboardCandidate,
  RecruiterDashboardContext,
  RecruiterDashboardData,
} from "@/lib/recruiter/dashboard.types";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type RpcCandidateRow = {
  id: string;
  vodora_id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  city: string | null;
  country: string | null;
  profile_picture_url: string | null;
  availability_status: string;
  availability_start: string | null;
  work_types: string[] | null;
  skills: string[] | null;
  verified: boolean;
  reference_count: number;
};

function normalizeCandidate(row: RpcCandidateRow): RecruiterDashboardCandidate {
  return {
    id: row.id,
    vodoraId: row.vodora_id,
    firstName: row.first_name,
    lastName: row.last_name,
    title: row.title,
    city: row.city,
    country: row.country,
    profilePictureUrl: row.profile_picture_url,
    availabilityStatus: row.availability_status,
    availabilityStart: row.availability_start,
    workTypes: row.work_types ?? [],
    skills: row.skills ?? [],
    verified: row.verified,
    referenceCount: row.reference_count,
  };
}

async function fetchRecruiterDashboardContext(
  supabase: Supabase,
): Promise<RecruiterDashboardContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: userRow, error: userError }, { data: recruiter }] =
    await Promise.all([
      supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("recruiters")
        .select("job_title, company_id")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  if (userError || !userRow) {
    return null;
  }

  let companyName: string | null = null;

  if (recruiter?.company_id) {
    const { data: company } = await supabase
      .from("companies")
      .select("name")
      .eq("id", recruiter.company_id)
      .maybeSingle();

    companyName = company?.name ?? null;
  }

  return {
    firstName: userRow.first_name,
    lastName: userRow.last_name,
    companyName,
    jobTitle: recruiter?.job_title ?? null,
  };
}

async function fetchRecruiterDashboardCandidates(
  supabase: Supabase,
): Promise<{ candidates: RecruiterDashboardCandidate[]; error: string | null }> {
  const { data, error } = await supabase.rpc("get_recruiter_dashboard_candidates", {
    p_limit: 50,
  });

  if (error) {
    return { candidates: [], error: error.message };
  }

  if (!Array.isArray(data)) {
    return { candidates: [], error: null };
  }

  return {
    candidates: data
      .filter((row): row is RpcCandidateRow => {
        if (!row || typeof row !== "object") {
          return false;
        }

        return "id" in row;
      })
      .map(normalizeCandidate),
    error: null,
  };
}

async function fetchRecruiterDashboardData(
  supabase: Supabase,
): Promise<RecruiterDashboardData | null> {
  const [context, candidateResult] = await Promise.all([
    fetchRecruiterDashboardContext(supabase),
    fetchRecruiterDashboardCandidates(supabase),
  ]);

  if (!context) {
    return null;
  }

  return {
    context,
    candidates: candidateResult.candidates,
    candidatesError: candidateResult.error,
  };
}

export const getCachedRecruiterDashboardData = cache(fetchRecruiterDashboardData);
