import type { SupabaseClient } from "@supabase/supabase-js";

import { getRelationshipLabel } from "@/components/profile/reference/types";
import type { Database } from "@/lib/supabase/database.types";

import type { QuestionnaireAnswers } from "@/lib/references/reference-questionnaire";

type Supabase = SupabaseClient<Database>;

export type CandidateReferenceItem = {
  id: string;
  refereeName: string;
  refereeTitle: string;
  refereeCompany: string;
  refereeEmail: string;
  refereePhone: string | null;
  relationship: string;
  relationshipLabel: string;
  employmentStart: string | null;
  employmentEnd: string | null;
  referenceType: string;
  status: string;
  createdAt: string;
  submittedAt: string | null;
  verifiedAt: string | null;
  writtenComments: string | null;
  questionnaireResponses: QuestionnaireAnswers | null;
  performanceRating: number | null;
  reliabilityRating: number | null;
  teamworkRating: number | null;
  leadershipRating: number | null;
  rehireRecommendation: boolean | null;
  employmentConfirmed: boolean | null;
  employmentDatesConfirmed: boolean | null;
};

export async function fetchCandidateReferences(
  supabase: Supabase,
  candidateId: string,
): Promise<{ references: CandidateReferenceItem[]; error?: string }> {
  const { data, error } = await supabase
    .from("reference_requests")
    .select(
      `
      id,
      referee_name,
      referee_title,
      referee_company,
      referee_email,
      referee_phone,
      relationship,
      employment_start,
      employment_end,
      reference_type,
      status,
      created_at,
      submitted_at,
      verified_at,
      reference_responses (
        written_comments,
        questionnaire_responses,
        performance_rating,
        reliability_rating,
        teamwork_rating,
        leadership_rating,
        rehire_recommendation,
        employment_confirmed,
        employment_dates_confirmed
      )
    `,
    )
    .eq("candidate_id", candidateId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchCandidateReferences failed:", error);
    return {
      references: [],
      error: "Unable to load references.",
    };
  }

  const references = (data ?? []).map((row) => {
    const response = Array.isArray(row.reference_responses)
      ? row.reference_responses[0]
      : row.reference_responses;

    return {
      id: row.id,
      refereeName: row.referee_name,
      refereeTitle: row.referee_title,
      refereeCompany: row.referee_company,
      refereeEmail: row.referee_email,
      refereePhone: row.referee_phone,
      relationship: row.relationship,
      relationshipLabel: getRelationshipLabel(row.relationship),
      employmentStart: row.employment_start,
      employmentEnd: row.employment_end,
      referenceType: row.reference_type,
      status: row.status,
      createdAt: row.created_at,
      submittedAt: row.submitted_at,
      verifiedAt: row.verified_at,
      writtenComments: response?.written_comments ?? null,
      questionnaireResponses: parseQuestionnaireResponses(
        response?.questionnaire_responses,
      ),
      performanceRating: response?.performance_rating ?? null,
      reliabilityRating: response?.reliability_rating ?? null,
      teamworkRating: response?.teamwork_rating ?? null,
      leadershipRating: response?.leadership_rating ?? null,
      rehireRecommendation: response?.rehire_recommendation ?? null,
      employmentConfirmed: response?.employment_confirmed ?? null,
      employmentDatesConfirmed: response?.employment_dates_confirmed ?? null,
    };
  });

  return { references };
}

function parseQuestionnaireResponses(
  value: unknown,
): QuestionnaireAnswers | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as QuestionnaireAnswers;
}

export async function cancelReferenceRequest(
  supabase: Supabase,
  candidateId: string,
  referenceId: string,
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from("reference_requests")
    .update({ status: "cancelled" })
    .eq("id", referenceId)
    .eq("candidate_id", candidateId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("cancelReferenceRequest failed:", error);
    return { success: false, error: "Unable to cancel reference request." };
  }

  if (!data) {
    return {
      success: false,
      error: "Only pending reference requests can be cancelled.",
    };
  }

  return { success: true };
}
