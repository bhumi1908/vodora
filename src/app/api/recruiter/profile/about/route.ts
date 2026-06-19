import { NextResponse } from "next/server";

import { validateRecruiterAbout } from "@/lib/recruiter/profile-validation";
import { requireOwnRecruiter } from "@/lib/recruiter/require-own-recruiter";
import { createClient } from "@/lib/supabase/server";

type AboutPayload = {
  bio?: string;
  specialisations?: string[];
  industries?: string[];
};

export async function PATCH(request: Request) {
  let body: AboutPayload;

  try {
    body = (await request.json()) as AboutPayload;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const validationError = validateRecruiterAbout({
    bio: body.bio ?? "",
    specialisations: body.specialisations ?? [],
    industries: body.industries ?? [],
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

  const bio = body.bio?.trim() || null;

  const { error: recruiterError } = await supabase
    .from("recruiters")
    .update({
      bio: bio ?? undefined,
      specialisations: body.specialisations ?? [],
      industries: body.industries ?? [],
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
