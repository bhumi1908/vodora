import { getRelationshipLabel } from "@/components/profile/reference/types";
import type { CandidateReferenceItem } from "@/lib/references/fetch-candidate-references";
import type { QuestionnaireAnswers } from "@/lib/references/reference-questionnaire";
import type { WrittenAssessmentAnswers } from "@/lib/references/written-reference-assessment";
import { isWrittenAssessmentAnswers } from "@/lib/references/written-reference-assessment";
import { createAdminClient } from "@/lib/supabase/admin";

export type RecruiterInitiatedReferenceItem = CandidateReferenceItem & {
  candidateId: string;
  candidateName: string;
};

type CandidateNameRow = {
  id: string;
  user_id: string;
};

type UserNameRow = {
  id: string;
  first_name: string;
  last_name: string;
};

function resolveUserName(row: UserNameRow | undefined): string {
  if (!row) {
    return "Unknown candidate";
  }

  const name = `${row.first_name} ${row.last_name}`.trim();
  return name || "Unknown candidate";
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

export async function fetchRecruiterInitiatedReferences(
  recruiterId: string,
): Promise<{ references: RecruiterInitiatedReferenceItem[]; error?: string }> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("reference_requests")
    .select(
      `
      id,
      candidate_id,
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
      invitation_sent_at,
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
    .eq("requested_by_recruiter_id", recruiterId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchRecruiterInitiatedReferences failed:", error);
    return {
      references: [],
      error: "Unable to load reference history.",
    };
  }

  const rows = data ?? [];
  const candidateIds = [...new Set(rows.map((row) => row.candidate_id))];
  const candidateNameById = new Map<string, string>();

  if (candidateIds.length > 0) {
    const { data: candidateRows, error: candidateError } = await admin
      .from("candidates")
      .select("id, user_id")
      .in("id", candidateIds);

    if (candidateError) {
      console.error(
        "fetchRecruiterInitiatedReferences candidate lookup failed:",
        candidateError,
      );
    } else {
      const userIds = [
        ...new Set(
          ((candidateRows ?? []) as CandidateNameRow[])
            .map((row) => row.user_id)
            .filter(Boolean),
        ),
      ];
      const userNameById = new Map<string, string>();

      if (userIds.length > 0) {
        const { data: userRows, error: userError } = await admin
          .from("users")
          .select("id, first_name, last_name")
          .in("id", userIds);

        if (userError) {
          console.error(
            "fetchRecruiterInitiatedReferences user lookup failed:",
            userError,
          );
        } else {
          for (const userRow of (userRows ?? []) as UserNameRow[]) {
            userNameById.set(userRow.id, resolveUserName(userRow));
          }
        }
      }

      for (const candidateRow of (candidateRows ?? []) as CandidateNameRow[]) {
        candidateNameById.set(
          candidateRow.id,
          userNameById.get(candidateRow.user_id) ?? "Unknown candidate",
        );
      }
    }
  }

  const references = rows.map((row) => {
    const response = Array.isArray(row.reference_responses)
      ? row.reference_responses[0]
      : row.reference_responses;

    return {
      id: row.id,
      candidateId: row.candidate_id,
      candidateName:
        candidateNameById.get(row.candidate_id) ?? "Unknown candidate",
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
      invitationSentAt: row.invitation_sent_at,
      submittedAt: row.submitted_at,
      verifiedAt: row.verified_at,
      writtenComments: response?.written_comments ?? null,
      questionnaireResponses: parseQuestionnaireResponses(
        response?.questionnaire_responses,
        row.reference_type,
      ),
      writtenAssessmentResponses: parseWrittenAssessmentResponses(
        response?.questionnaire_responses,
        row.reference_type,
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
