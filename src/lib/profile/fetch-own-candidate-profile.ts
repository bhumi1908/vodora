import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import type { CandidateProfileEditData } from "@/components/profile/edit/types";
import { normalizeRpcResult } from "@/lib/profile/transform-own-candidate-profile";
import type { OwnCandidateProfileRpcResult } from "@/lib/profile/own-candidate-profile-rpc.types";
import type { CandidateProfileData } from "@/lib/profile/types";
import {
  transformOwnCandidateProfileToEdit,
  transformOwnCandidateProfileToView,
} from "@/lib/profile/transform-own-candidate-profile";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

async function fetchOwnCandidateProfileFallback(
  supabase: Supabase,
): Promise<OwnCandidateProfileRpcResult | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: userRow, error: userError }, { data: candidate }] =
    await Promise.all([
      supabase
        .from("users")
        .select("id, first_name, last_name, email, phone, city, country")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("candidates")
        .select(
          "id, vodora_id, profession, current_position, current_company_name, headline, summary, city, country, linkedin_profile_url, profile_picture_url, availability_status, availability_start, experience_level, total_years_experience",
        )
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  if (userError || !userRow) {
    return null;
  }

  const baseResult: OwnCandidateProfileRpcResult = {
    user: {
      id: userRow.id,
      first_name: userRow.first_name,
      last_name: userRow.last_name,
      email: userRow.email,
      phone: userRow.phone,
      city: userRow.city,
      country: userRow.country,
    },
    candidate: candidate
      ? {
          id: candidate.id,
          vodora_id: candidate.vodora_id,
          profession: candidate.profession,
          current_position: candidate.current_position,
          current_company_name: candidate.current_company_name,
          headline: candidate.headline,
          summary: candidate.summary,
          city: candidate.city,
          country: candidate.country,
          linkedin_profile_url: candidate.linkedin_profile_url,
          profile_picture_url: candidate.profile_picture_url,
          availability_status: candidate.availability_status,
          availability_start: candidate.availability_start,
          experience_level: candidate.experience_level,
          total_years_experience: candidate.total_years_experience,
        }
      : null,
    skills: [],
    employment: [],
    education: [],
    documents: [],
  };

  if (!candidate) {
    return baseResult;
  }

  const [
    { data: skills },
    { data: employment },
    { data: education },
    { data: documents },
  ] = await Promise.all([
    supabase
      .from("candidate_skills")
      .select("id, skill_name, proficiency, years_experience")
      .eq("candidate_id", candidate.id)
      .order("skill_name"),
    supabase
      .from("employment_history")
      .select(
        "id, job_title, company_name, location, start_date, end_date, is_current, description, sort_order",
      )
      .eq("candidate_id", candidate.id)
      .order("sort_order")
      .order("start_date", { ascending: false }),
    supabase
      .from("candidate_education")
      .select(
        "id, degree_or_class, institution_name, start_date, end_date, description, sort_order",
      )
      .eq("candidate_id", candidate.id)
      .order("sort_order")
      .order("start_date", { ascending: false }),
    supabase
      .from("candidate_documents")
      .select(
        "id, document_type, file_name, file_url, uploaded_at, is_primary",
      )
      .eq("candidate_id", candidate.id)
      .order("uploaded_at", { ascending: false }),
  ]);

  return {
    ...baseResult,
    skills:
      skills?.map((skill) => ({
        id: skill.id,
        skill_name: skill.skill_name,
        proficiency: skill.proficiency,
        years_experience: skill.years_experience,
      })) ?? [],
    employment:
      employment?.map((entry) => ({
        id: entry.id,
        job_title: entry.job_title,
        company_name: entry.company_name,
        location: entry.location,
        start_date: entry.start_date,
        end_date: entry.end_date,
        is_current: entry.is_current,
        description: entry.description,
        sort_order: entry.sort_order,
      })) ?? [],
    education:
      education?.map((entry) => ({
        id: entry.id,
        degree_or_class: entry.degree_or_class,
        institution_name: entry.institution_name,
        start_date: entry.start_date,
        end_date: entry.end_date,
        description: entry.description,
        sort_order: entry.sort_order,
      })) ?? [],
    documents:
      documents?.map((document) => ({
        id: document.id,
        document_type: document.document_type,
        file_name: document.file_name,
        file_url: document.file_url,
        uploaded_at: document.uploaded_at,
        is_primary: document.is_primary,
      })) ?? [],
  };
}

async function fetchOwnCandidateProfileRaw(
  supabase: Supabase,
): Promise<OwnCandidateProfileRpcResult | null> {
  const { data, error } = await supabase.rpc("get_own_candidate_profile");

  if (!error && data) {
    const normalized = normalizeRpcResult(data);
    if (normalized) {
      return normalized;
    }
  }

  return fetchOwnCandidateProfileFallback(supabase);
}

export const getCachedOwnCandidateProfileRaw = cache(fetchOwnCandidateProfileRaw);

export async function getOwnCandidateProfile(
  supabase: Supabase,
): Promise<CandidateProfileData | null> {
  const raw = await getCachedOwnCandidateProfileRaw(supabase);

  if (!raw) {
    return null;
  }

  return transformOwnCandidateProfileToView(raw);
}

export async function getOwnCandidateProfileForEdit(
  supabase: Supabase,
): Promise<CandidateProfileEditData | null> {
  const raw = await getCachedOwnCandidateProfileRaw(supabase);

  if (!raw) {
    return null;
  }

  return transformOwnCandidateProfileToEdit(raw);
}
