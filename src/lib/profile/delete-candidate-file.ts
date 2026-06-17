import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export const CANDIDATE_FILES_BUCKET = "candidate-files";

const PUBLIC_URL_MARKERS = [
  `/storage/v1/object/public/${CANDIDATE_FILES_BUCKET}/`,
  `/storage/v1/object/sign/${CANDIDATE_FILES_BUCKET}/`,
  `/storage/v1/object/authenticated/${CANDIDATE_FILES_BUCKET}/`,
] as const;

export function extractCandidateFilePath(publicUrl: string): string | null {
  for (const marker of PUBLIC_URL_MARKERS) {
    const index = publicUrl.indexOf(marker);

    if (index !== -1) {
      const rawPath = publicUrl.slice(index + marker.length).split("?")[0];
      return decodeURIComponent(rawPath);
    }
  }

  return null;
}

function isStorageNotFoundError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("not found") || normalized.includes("object not found");
}

export async function deleteCandidateFile(
  supabase: Supabase,
  publicUrl: string,
  userId: string,
): Promise<{ success: true } | { error: string }> {
  const path = extractCandidateFilePath(publicUrl);

  if (!path) {
    return { error: "Could not resolve file location." };
  }

  if (!path.startsWith(`${userId}/`)) {
    return { error: "Unauthorized file path." };
  }

  const { error } = await supabase.storage
    .from(CANDIDATE_FILES_BUCKET)
    .remove([path]);

  if (error && !isStorageNotFoundError(error.message)) {
    return { error: error.message };
  }

  return { success: true };
}
