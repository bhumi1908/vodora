import { getRelationshipLabel } from "@/components/profile/reference/types";

import type { CandidateReferenceItem } from "@/lib/references/fetch-candidate-references";
import type { QuestionnaireAnswers } from "@/lib/references/reference-questionnaire";
import type { WrittenAssessmentAnswers } from "@/lib/references/written-reference-assessment";
import { isWrittenAssessmentAnswers } from "@/lib/references/written-reference-assessment";

export type ReferenceRpcRow = {
  id: string;
  referee_name: string;
  referee_title: string;
  referee_company: string;
  referee_email: string | null;
  referee_phone: string | null;
  relationship: string;
  employment_start: string | null;
  employment_end: string | null;
  reference_type: string;
  status: string;
  created_at: string;
  submitted_at: string | null;
  verified_at: string | null;
  written_comments: string | null;
  questionnaire_responses: unknown;
  performance_rating: number | null;
  reliability_rating: number | null;
  teamwork_rating: number | null;
  leadership_rating: number | null;
  rehire_recommendation: boolean | null;
  employment_confirmed: boolean | null;
  employment_dates_confirmed: boolean | null;
};

export function mapReferenceRpcRows(
  rows: ReferenceRpcRow[],
): CandidateReferenceItem[] {
  return rows.map((row) => ({
    id: row.id,
    refereeName: row.referee_name,
    refereeTitle: row.referee_title,
    refereeCompany: row.referee_company,
    refereeEmail: row.referee_email ?? "",
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
    writtenComments: row.written_comments,
    questionnaireResponses: parseQuestionnaireResponses(
      row.questionnaire_responses,
      row.reference_type,
    ),
    writtenAssessmentResponses: parseWrittenAssessmentResponses(
      row.questionnaire_responses,
      row.reference_type,
    ),
    performanceRating: row.performance_rating,
    reliabilityRating: row.reliability_rating,
    teamworkRating: row.teamwork_rating,
    leadershipRating: row.leadership_rating,
    rehireRecommendation: row.rehire_recommendation,
    employmentConfirmed: row.employment_confirmed,
    employmentDatesConfirmed: row.employment_dates_confirmed,
  }));
}

function parseQuestionnaireResponses(
  value: unknown,
  referenceType: string,
): QuestionnaireAnswers | null {
  if (referenceType !== "questionnaire") {
    return null;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as QuestionnaireAnswers;
}

function parseWrittenAssessmentResponses(
  value: unknown,
  referenceType: string,
): WrittenAssessmentAnswers | null {
  if (referenceType === "questionnaire") {
    return null;
  }

  if (!isWrittenAssessmentAnswers(value)) {
    return null;
  }

  return value;
}

export function parseReferenceRpcRows(value: unknown): ReferenceRpcRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as ReferenceRpcRow[];
}
