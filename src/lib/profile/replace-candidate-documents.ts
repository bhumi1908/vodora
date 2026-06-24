import type { SupabaseClient } from "@supabase/supabase-js";

import { deleteCandidateFile } from "@/lib/profile/delete-candidate-file";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type CandidateDocumentRow = { id: string; file_url: string };

export function shouldReplaceDocumentsOnUpload(
  documentType: string,
  isPrimary: boolean,
): boolean {
  if (documentType === "profile_photo") {
    return true;
  }

  return documentType === "resume" && isPrimary;
}

export async function fetchCandidateDocumentsOfType(
  supabase: Supabase,
  candidateId: string,
  documentType: string,
): Promise<CandidateDocumentRow[]> {
  const { data } = await supabase
    .from("candidate_documents")
    .select("id, file_url")
    .eq("candidate_id", candidateId)
    .eq("document_type", documentType);

  return data ?? [];
}

export async function deleteCandidateDocuments(
  supabase: Supabase,
  documents: CandidateDocumentRow[],
  userId: string,
): Promise<void> {
  if (documents.length === 0) {
    return;
  }

  for (const document of documents) {
    await deleteCandidateFile(supabase, document.file_url, userId);
  }

  await supabase
    .from("candidate_documents")
    .delete()
    .in(
      "id",
      documents.map((document) => document.id),
    );
}

export async function deleteStoredProfilePhotoUrl(
  supabase: Supabase,
  publicUrl: string | null | undefined,
  userId: string,
  excludeUrl?: string,
): Promise<void> {
  if (!publicUrl || publicUrl === excludeUrl) {
    return;
  }

  await deleteCandidateFile(supabase, publicUrl, userId);
}
