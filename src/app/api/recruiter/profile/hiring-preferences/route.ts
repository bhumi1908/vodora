import { NextResponse } from "next/server";

import { validateRecruiterHiringPreferences } from "@/lib/recruiter/profile-validation";
import { requireOwnRecruiter } from "@/lib/recruiter/require-own-recruiter";
import { createClient } from "@/lib/supabase/server";

type HiringPreferencesPayload = {
  preferredWorkTypeCodes?: string[];
  preferredExperienceLevels?: string[];
  remotePreference?: string;
};

export async function PATCH(request: Request) {
  let body: HiringPreferencesPayload;

  try {
    body = (await request.json()) as HiringPreferencesPayload;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const validationError = validateRecruiterHiringPreferences({
    preferredWorkTypeCodes: body.preferredWorkTypeCodes ?? [],
    preferredExperienceLevels: body.preferredExperienceLevels ?? [],
    remotePreference: body.remotePreference ?? "",
  });

  if (validationError) {
    return NextResponse.json(
      { success: false, error: validationError },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const context = await requireOwnRecruiter(supabase);

  if (!context) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  const remotePreference = body.remotePreference?.trim() || null;

  const { error: recruiterError } = await supabase
    .from("recruiters")
    .update({
      preferred_work_type_codes: body.preferredWorkTypeCodes ?? [],
      preferred_experience_levels: body.preferredExperienceLevels ?? [],
      remote_preference: remotePreference ?? undefined,
    })
    .eq("id", context.recruiterId);

  if (recruiterError) {
    return NextResponse.json(
      { success: false, error: recruiterError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
