import { NextResponse } from "next/server";

import { uploadCandidateFile } from "@/lib/profile/upload-candidate-file";
import { validateProfileFile } from "@/lib/profile/validation";
import { requireOwnRecruiter } from "@/lib/recruiter/require-own-recruiter";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const context = await requireOwnRecruiter(supabase);

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

  const { error: recruiterError } = await supabase
    .from("recruiters")
    .update({ profile_picture_url: uploadResult.publicUrl })
    .eq("id", context.recruiterId);

  if (recruiterError) {
    return NextResponse.json(
      { success: false, error: recruiterError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    profilePictureUrl: uploadResult.publicUrl,
  });
}
