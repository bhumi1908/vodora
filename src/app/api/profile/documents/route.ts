import { NextResponse } from "next/server";

import { deleteCandidateFile } from "@/lib/profile/delete-candidate-file";
import { requireOwnCandidate } from "@/lib/profile/require-own-candidate";
import { uploadCandidateFile } from "@/lib/profile/upload-candidate-file";
import { validateProfileFile } from "@/lib/profile/validation";
import { createClient } from "@/lib/supabase/server";

const VALID_DOCUMENT_TYPES = new Set([
  "resume",
  "profile_photo",
  "cover_letter",
  "certificate",
  "experience_letter",
  "other",
]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const context = await requireOwnCandidate(supabase);

  if (!context) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const documentType = String(formData.get("documentType") ?? "other").trim();
  const isPrimary = formData.get("isPrimary") === "true";

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { success: false, error: "A file is required." },
      { status: 400 },
    );
  }

  const fileValidationError = validateProfileFile(file);

  if (fileValidationError) {
    return NextResponse.json(
      { success: false, error: fileValidationError },
      { status: 400 },
    );
  }

  if (!VALID_DOCUMENT_TYPES.has(documentType)) {
    return NextResponse.json(
      { success: false, error: "Invalid document type." },
      { status: 400 },
    );
  }

  const uploadResult = await uploadCandidateFile(
    supabase,
    context.userId,
    file,
    documentType,
  );

  if ("error" in uploadResult) {
    return NextResponse.json(
      { success: false, error: uploadResult.error },
      { status: 400 },
    );
  }

  if (isPrimary) {
    await supabase
      .from("candidate_documents")
      .update({ is_primary: false })
      .eq("candidate_id", context.candidateId)
      .eq("document_type", documentType);
  }

  const { data: inserted, error } = await supabase
    .from("candidate_documents")
    .insert({
      candidate_id: context.candidateId,
      document_type: documentType,
      file_name: file.name,
      file_url: uploadResult.publicUrl,
      file_size_bytes: uploadResult.sizeBytes,
      mime_type: uploadResult.mimeType,
      is_primary: isPrimary,
    })
    .select("id, document_type, file_name, file_url, uploaded_at, is_primary")
    .single();

  if (error || !inserted) {
    await deleteCandidateFile(supabase, uploadResult.publicUrl, context.userId);
    return NextResponse.json(
      { success: false, error: error?.message ?? "Failed to save document." },
      { status: 500 },
    );
  }

  if (documentType === "profile_photo") {
    await supabase
      .from("candidates")
      .update({ profile_picture_url: uploadResult.publicUrl })
      .eq("id", context.candidateId);
  }

  return NextResponse.json({
    success: true,
    document: {
      id: inserted.id,
      name: inserted.file_name,
      type: inserted.document_type,
      url: inserted.file_url,
      uploadedAt: inserted.uploaded_at,
      isPrimary: inserted.is_primary,
    },
  });
}

export async function DELETE(request: Request) {
  let body: { id?: string };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!body.id) {
    return NextResponse.json(
      { success: false, error: "Document id is required." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const context = await requireOwnCandidate(supabase);

  if (!context) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  const { data: document, error: fetchError } = await supabase
    .from("candidate_documents")
    .select("id, document_type, file_url")
    .eq("id", body.id)
    .eq("candidate_id", context.candidateId)
    .maybeSingle();

  if (fetchError || !document) {
    return NextResponse.json(
      { success: false, error: "Document not found." },
      { status: 404 },
    );
  }

  const storageResult = await deleteCandidateFile(
    supabase,
    document.file_url,
    context.userId,
  );

  if ("error" in storageResult) {
    return NextResponse.json(
      { success: false, error: storageResult.error },
      { status: 500 },
    );
  }

  const { error } = await supabase
    .from("candidate_documents")
    .delete()
    .eq("id", body.id)
    .eq("candidate_id", context.candidateId);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  if (document.document_type === "profile_photo") {
    const { data: candidate } = await supabase
      .from("candidates")
      .select("profile_picture_url")
      .eq("id", context.candidateId)
      .maybeSingle();

    if (candidate?.profile_picture_url === document.file_url) {
      await supabase
        .from("candidates")
        .update({ profile_picture_url: null })
        .eq("id", context.candidateId);
    }
  }

  return NextResponse.json({ success: true });
}
