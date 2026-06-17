import type { SupabaseClient } from "@supabase/supabase-js";

import {
  MAX_PROFILE_FILE_SIZE_BYTES,
  MAX_PROFILE_FILE_SIZE_LABEL,
  validateProfileFile,
} from "@/lib/profile/validation";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

const CANDIDATE_FILES_BUCKET = "candidate-files";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadCandidateFile(
  supabase: Supabase,
  userId: string,
  file: File,
  folder: string,
  options: { imagesOnly?: boolean } = {},
): Promise<{ publicUrl: string; mimeType: string; sizeBytes: number } | { error: string }> {
  const validationError = validateProfileFile(file, options);

  if (validationError) {
    return { error: validationError };
  }

  if (!options.imagesOnly && !ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      error: "Unsupported file type. Upload PDF, Word, JPEG, PNG, or WebP files.",
    };
  }

  const objectPath = `${userId}/${folder}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const fileBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(CANDIDATE_FILES_BUCKET)
    .upload(objectPath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    if (uploadError.message.toLowerCase().includes("file size")) {
      return { error: `File must be ${MAX_PROFILE_FILE_SIZE_LABEL} or smaller.` };
    }

    return {
      error:
        uploadError.message.includes("Bucket not found")
          ? "File storage is not configured yet. Please contact support."
          : uploadError.message,
    };
  }

  const { data } = supabase.storage
    .from(CANDIDATE_FILES_BUCKET)
    .getPublicUrl(objectPath);

  return {
    publicUrl: data.publicUrl,
    mimeType: file.type,
    sizeBytes: file.size,
  };
}

export { MAX_PROFILE_FILE_SIZE_BYTES, MAX_PROFILE_FILE_SIZE_LABEL };
