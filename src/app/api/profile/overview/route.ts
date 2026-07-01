import { NextResponse } from "next/server";

import { validateOverview } from "@/lib/profile/validation";
import { requireOwnCandidate } from "@/lib/profile/require-own-candidate";
import { createClient } from "@/lib/supabase/server";

type OverviewPayload = {
  about?: string;
  title?: string;
  company?: string;
  phone?: string;
  website?: string;
  city?: string;
  country?: string;
  availabilityStatus?: string;
  availabilityStart?: string;
  totalYearsExperience?: string;
  experienceLevel?: string;
};

export async function PATCH(request: Request) {
  let body: OverviewPayload;

  try {
    body = (await request.json()) as OverviewPayload;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const validationError = validateOverview(body);

  if (validationError) {
    return NextResponse.json(
      { success: false, error: validationError },
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

  const phone = body.phone?.trim() || null;
  const city = body.city?.trim() || null;
  const country = body.country?.trim() || null;

  const { error: userError } = await supabase
    .from("users")
    .update({
      phone,
      city,
      country,
    })
    .eq("id", context.userId);

  if (userError) {
    return NextResponse.json(
      { success: false, error: userError.message },
      { status: 500 },
    );
  }

  const title = body.title?.trim() || null;
  const company = body.company?.trim() || null;
  const website = body.website?.trim() || null;
  const about = body.about?.trim() || null;
  const availabilityStatus = body.availabilityStatus?.trim() || "not_looking";
  const availabilityStart =
    availabilityStatus === "not_looking"
      ? null
      : body.availabilityStart?.trim() || null;
  const experienceLevel = body.experienceLevel?.trim() || null;
  const totalYearsRaw = body.totalYearsExperience?.trim() ?? "";
  const totalYearsExperience = totalYearsRaw
    ? Number.parseInt(totalYearsRaw, 10)
    : null;

  const { error: candidateError } = await supabase
    .from("candidates")
    .update({
      summary: about,
      current_position: title,
      headline: title,
      current_company_name: company,
      linkedin_profile_url: website,
      city,
      country,
      availability_status: availabilityStatus,
      availability_start: availabilityStart,
      availability_updated_at: new Date().toISOString(),
      experience_level: experienceLevel,
      total_years_experience: totalYearsExperience,
    })
    .eq("id", context.candidateId);

  if (candidateError) {
    return NextResponse.json(
      { success: false, error: candidateError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
