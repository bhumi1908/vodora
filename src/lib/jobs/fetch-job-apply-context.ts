import type { SupabaseClient } from "@supabase/supabase-js";

import { buildDefaultCoverLetter } from "@/lib/jobs/build-default-cover-letter";
import type {
  JobApplyContext,
  JobApplyCoverLetterDocument,
  JobApplyResume,
} from "@/lib/jobs/job-application.types";
import { requireOwnCandidate } from "@/lib/profile/require-own-candidate";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

function formatLocation(
  city: string | null | undefined,
  country: string | null | undefined,
): string {
  const parts = [city?.trim(), country?.trim()].filter(Boolean);
  return parts.join(", ");
}

function pickPrimaryDocument<
  T extends { document_type: string; is_primary: boolean },
>(documents: T[], documentType: string): T | null {
  const typed = documents.filter((doc) => doc.document_type === documentType);

  if (typed.length === 0) {
    return null;
  }

  return typed.find((doc) => doc.is_primary) ?? typed[0] ?? null;
}

export async function fetchJobApplyContext(
  supabase: Supabase,
  jobPostingId: string,
  jobMeta: {
    title: string;
    company: string;
    recruiterName: string;
  },
): Promise<{ context: JobApplyContext | null; error: string | null }> {
  const candidateContext = await requireOwnCandidate(supabase);

  if (!candidateContext) {
    return { context: null, error: "Authentication required." };
  }

  const [
    { data: userRow, error: userError },
    { data: candidateRow, error: candidateError },
    { data: documents, error: documentsError },
    { data: existingApplication },
    { data: verifiedReferences, error: verifiedReferencesError },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("first_name, last_name, email, phone, city, country")
      .eq("id", candidateContext.userId)
      .maybeSingle(),
    supabase
      .from("candidates")
      .select("city, country, default_cover_letter")
      .eq("id", candidateContext.candidateId)
      .maybeSingle(),
    supabase
      .from("candidate_documents")
      .select(
        "id, document_type, file_name, mime_type, file_size_bytes, uploaded_at, is_primary",
      )
      .eq("candidate_id", candidateContext.candidateId)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("job_applications")
      .select("id")
      .eq("job_posting_id", jobPostingId)
      .eq("candidate_id", candidateContext.candidateId)
      .maybeSingle(),
    supabase
      .from("reference_requests")
      .select("id, referee_name, referee_title, referee_company")
      .eq("candidate_id", candidateContext.candidateId)
      .eq("status", "verified")
      .order("verified_at", { ascending: false }),
  ]);

  if (userError || !userRow) {
    return { context: null, error: userError?.message ?? "Could not load profile." };
  }

  if (candidateError) {
    return { context: null, error: candidateError.message };
  }

  if (documentsError) {
    return { context: null, error: documentsError.message };
  }

  if (verifiedReferencesError) {
    return { context: null, error: verifiedReferencesError.message };
  }

  const fullName = [userRow.first_name, userRow.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  const location =
    formatLocation(candidateRow?.city, candidateRow?.country) ||
    formatLocation(userRow.city, userRow.country) ||
    "Not specified";

  const resumeDoc = pickPrimaryDocument(documents ?? [], "resume");
  const coverLetterDoc = pickPrimaryDocument(documents ?? [], "cover_letter");

  const resume: JobApplyResume | null = resumeDoc
    ? {
        id: resumeDoc.id,
        fileName: resumeDoc.file_name,
        mimeType: resumeDoc.mime_type,
        fileSizeBytes: resumeDoc.file_size_bytes,
        uploadedAt: resumeDoc.uploaded_at,
      }
    : null;

  const coverLetterDocument: JobApplyCoverLetterDocument | null = coverLetterDoc
    ? {
        id: coverLetterDoc.id,
        fileName: coverLetterDoc.file_name,
        uploadedAt: coverLetterDoc.uploaded_at,
      }
    : null;

  const savedCoverLetter = candidateRow?.default_cover_letter?.trim();
  const coverLetter =
    savedCoverLetter ??
    buildDefaultCoverLetter({
      recruiterName: jobMeta.recruiterName,
      jobTitle: jobMeta.title,
      company: jobMeta.company,
      candidateName: fullName,
    });

  return {
    context: {
      fullName: fullName || "Candidate",
      email: userRow.email,
      phone: userRow.phone?.trim() || "Not specified",
      location,
      resume,
      coverLetter,
      coverLetterDocument,
      alreadyApplied: Boolean(existingApplication),
      verifiedReferences: (verifiedReferences ?? []).map((reference) => ({
        id: reference.id,
        refereeName: reference.referee_name,
        refereeTitle: reference.referee_title,
        refereeCompany: reference.referee_company,
      })),
    },
    error: null,
  };
}
