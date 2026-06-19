import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import type { OwnRecruiterProfileRpcResult } from "@/lib/recruiter/own-recruiter-profile-rpc.types";
import type { RecruiterProfileData } from "@/lib/recruiter/recruiter-profile.types";
import {
  normalizeOwnRecruiterProfileRpcResult,
  transformOwnRecruiterProfileToView,
} from "@/lib/recruiter/transform-own-recruiter-profile";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

async function fetchOwnRecruiterProfileFallback(
  supabase: Supabase,
): Promise<OwnRecruiterProfileRpcResult | null> {
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
        .select(
          "id, first_name, last_name, email, phone, city, country, email_verified_at",
        )
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("recruiters")
        .select("id, job_title, bio, recruiter_type, company_id")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  if (userError || !userRow) {
    return null;
  }

  let company: OwnRecruiterProfileRpcResult["company"] = null;

  if (recruiter?.company_id) {
    const { data: companyRow } = await supabase
      .from("companies")
      .select("id, name, website, city, country, is_verified")
      .eq("id", recruiter.company_id)
      .maybeSingle();

    if (companyRow) {
      company = {
        id: companyRow.id,
        name: companyRow.name,
        website: companyRow.website,
        city: companyRow.city,
        country: companyRow.country,
        is_verified: companyRow.is_verified,
      };
    }
  }

  return {
    user: {
      id: userRow.id,
      first_name: userRow.first_name,
      last_name: userRow.last_name,
      email: userRow.email,
      phone: userRow.phone,
      city: userRow.city,
      country: userRow.country,
      email_verified_at: userRow.email_verified_at,
    },
    recruiter: recruiter
      ? {
          id: recruiter.id,
          job_title: recruiter.job_title,
          bio: recruiter.bio,
          recruiter_type: recruiter.recruiter_type,
        }
      : null,
    company,
  };
}

async function fetchOwnRecruiterProfileRaw(
  supabase: Supabase,
): Promise<OwnRecruiterProfileRpcResult | null> {
  const { data, error } = await supabase.rpc("get_own_recruiter_profile");

  if (!error && data) {
    const normalized = normalizeOwnRecruiterProfileRpcResult(data);
    if (normalized) {
      return normalized;
    }
  }

  return fetchOwnRecruiterProfileFallback(supabase);
}

export const getCachedOwnRecruiterProfileRaw = cache(fetchOwnRecruiterProfileRaw);

export async function getOwnRecruiterProfile(
  supabase: Supabase,
): Promise<RecruiterProfileData | null> {
  const raw = await getCachedOwnRecruiterProfileRaw(supabase);

  if (!raw) {
    return null;
  }

  return transformOwnRecruiterProfileToView(raw);
}
