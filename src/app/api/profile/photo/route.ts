import { NextResponse } from "next/server";

import { requireOwnCandidate } from "@/lib/profile/require-own-candidate";
import { uploadCandidateFile } from "@/lib/profile/upload-candidate-file";
import { validateProfileFile } from "@/lib/profile/validation";
import { createClient } from "@/lib/supabase/server";

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

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { success: false, error: "A photo file is required." },
      { status: 400 },
    );
  }

  const fileValidationError = validateProfileFile(file, { imagesOnly: true });

  if (fileValidationError) {
    return NextResponse.json(
      { success: false, error: fileValidationError },
      { status: 400 },
    );
  }

  const uploadResult = await uploadCandidateFile(
    supabase,
    context.userId,
    file,
    "profile_photo",
    { imagesOnly: true },
  );

  if ("error" in uploadResult) {
    return NextResponse.json(
      { success: false, error: uploadResult.error },
      { status: 400 },
    );
  }

  await supabase
    .from("candidate_documents")
    .update({ is_primary: false })
    .eq("candidate_id", context.candidateId)
    .eq("document_type", "profile_photo");

  const { error: documentError } = await supabase
    .from("candidate_documents")
    .insert({
      candidate_id: context.candidateId,
      document_type: "profile_photo",
      file_name: file.name,
      file_url: uploadResult.publicUrl,
      file_size_bytes: uploadResult.sizeBytes,
      mime_type: uploadResult.mimeType,
      is_primary: true,
    });

  if (documentError) {
    return NextResponse.json(
      { success: false, error: documentError.message },
      { status: 500 },
    );
  }

  const { error: candidateError } = await supabase
    .from("candidates")
    .update({ profile_picture_url: uploadResult.publicUrl })
    .eq("id", context.candidateId);

  if (candidateError) {
    return NextResponse.json(
      { success: false, error: candidateError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    profilePictureUrl: uploadResult.publicUrl,
  });
}
