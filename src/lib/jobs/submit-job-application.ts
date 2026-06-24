import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  SubmitJobApplicationPayload,
  SubmitJobApplicationResult,
} from "@/lib/jobs/job-application.types";
import { createReferenceRecruiterGrant } from "@/lib/references/create-reference-recruiter-grant";
import { resolveIncludedReferenceIds } from "@/lib/references/resolve-included-reference-ids";
import { requireOwnCandidate } from "@/lib/profile/require-own-candidate";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function submitJobApplication(
  supabase: Supabase,
  jobPostingId: string,
  payload: SubmitJobApplicationPayload,
): Promise<SubmitJobApplicationResult> {
  const candidateContext = await requireOwnCandidate(supabase);

  if (!candidateContext) {
    return {
      applicationId: "",
      alreadyApplied: false,
      error: "Authentication required.",
    };
  }

  const coverLetter = payload.coverLetter.trim();

  if (!coverLetter) {
    return {
      applicationId: "",
      alreadyApplied: false,
      error: "Cover letter is required.",
    };
  }

  const resolvedReferences = await resolveIncludedReferenceIds(
    supabase,
    candidateContext.candidateId,
    payload.referencesAttached ?? false,
    payload.includedReferenceIds,
  );

  if (resolvedReferences.error) {
    return {
      applicationId: "",
      alreadyApplied: false,
      error: resolvedReferences.error,
    };
  }

  const { data: jobPosting, error: jobError } = await supabase
    .from("job_postings")
    .select("id, status, closes_at, recruiter_id")
    .eq("id", jobPostingId)
    .maybeSingle();

  if (jobError) {
    return {
      applicationId: "",
      alreadyApplied: false,
      error: jobError.message,
    };
  }

  if (!jobPosting || jobPosting.status !== "published") {
    return {
      applicationId: "",
      alreadyApplied: false,
      error: "This job is no longer accepting applications.",
    };
  }

  if (jobPosting.closes_at && new Date(jobPosting.closes_at) <= new Date()) {
    return {
      applicationId: "",
      alreadyApplied: false,
      error: "This job is no longer accepting applications.",
    };
  }

  const { data: existingApplication } = await supabase
    .from("job_applications")
    .select("id")
    .eq("job_posting_id", jobPostingId)
    .eq("candidate_id", candidateContext.candidateId)
    .maybeSingle();

  if (existingApplication) {
    return {
      applicationId: existingApplication.id,
      alreadyApplied: true,
      error: null,
    };
  }

  const { data: resumeDocument } = await supabase
    .from("candidate_documents")
    .select("id")
    .eq("candidate_id", candidateContext.candidateId)
    .eq("document_type", "resume")
    .order("is_primary", { ascending: false })
    .order("uploaded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!resumeDocument) {
    return {
      applicationId: "",
      alreadyApplied: false,
      error: "Upload a resume to your profile before applying.",
    };
  }

  let coverLetterDocumentId = payload.coverLetterDocumentId ?? null;

  if (coverLetterDocumentId) {
    const { data: coverDoc } = await supabase
      .from("candidate_documents")
      .select("id")
      .eq("id", coverLetterDocumentId)
      .eq("candidate_id", candidateContext.candidateId)
      .eq("document_type", "cover_letter")
      .maybeSingle();

    if (!coverDoc) {
      coverLetterDocumentId = null;
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from("job_applications")
    .insert({
      job_posting_id: jobPostingId,
      candidate_id: candidateContext.candidateId,
      cover_letter: coverLetter,
      resume_document_id: resumeDocument.id,
      cover_letter_document_id: coverLetterDocumentId,
      references_attached: resolvedReferences.referencesAttached,
      included_reference_ids: resolvedReferences.includedReferenceIds,
      status: "applied",
    })
    .select("id")
    .single();

  if (insertError) {
    const duplicate =
      insertError.code === "23505" ||
      insertError.message.toLowerCase().includes("duplicate");

    if (duplicate) {
      return {
        applicationId: "",
        alreadyApplied: true,
        error: null,
      };
    }

    return {
      applicationId: "",
      alreadyApplied: false,
      error: insertError.message,
    };
  }

  if (resolvedReferences.referencesAttached) {
    const grantResult = await createReferenceRecruiterGrant(supabase, {
      candidateId: candidateContext.candidateId,
      recruiterId: jobPosting.recruiter_id,
      jobApplicationId: inserted.id,
      shareType: resolvedReferences.shareType,
      includedReferenceIds: resolvedReferences.includedReferenceIds,
    });

    if (!grantResult.success) {
      return {
        applicationId: inserted.id,
        alreadyApplied: false,
        error: grantResult.error ?? null,
      };
    }
  }

  const { error: profileUpdateError } = await supabase
    .from("candidates")
    .update({ default_cover_letter: coverLetter })
    .eq("id", candidateContext.candidateId);

  if (profileUpdateError) {
    return {
      applicationId: inserted.id,
      alreadyApplied: false,
      error: null,
    };
  }

  return {
    applicationId: inserted.id,
    alreadyApplied: false,
    error: null,
  };
}
