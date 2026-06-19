import { NextResponse } from "next/server";

import { validateRecruiterCompany } from "@/lib/recruiter/profile-validation";
import { requireOwnRecruiter } from "@/lib/recruiter/require-own-recruiter";
import { createClient } from "@/lib/supabase/server";

type CompanyPayload = {
  companyName?: string;
  website?: string;
  city?: string;
  country?: string;
  employeeCount?: string;
  hiresPerYear?: string;
  recruiterType?: string;
};

export async function PATCH(request: Request) {
  let body: CompanyPayload;

  try {
    body = (await request.json()) as CompanyPayload;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const validationError = validateRecruiterCompany({
    companyName: body.companyName ?? "",
    website: body.website ?? "",
    city: body.city ?? "",
    country: body.country ?? "",
    employeeCount: body.employeeCount ?? "",
    hiresPerYear: body.hiresPerYear ?? "",
    recruiterType: body.recruiterType ?? "",
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

  if (!context.companyId) {
    return NextResponse.json(
      { success: false, error: "No company linked to this recruiter." },
      { status: 404 },
    );
  }

  const city = body.city?.trim() || null;
  const country = body.country?.trim() || null;
  const companyName = body.companyName?.trim() || null;
  const website = body.website?.trim() || null;

  const { error: userError } = await supabase
    .from("users")
    .update({ city, country })
    .eq("id", context.userId);

  if (userError) {
    return NextResponse.json(
      { success: false, error: userError.message },
      { status: 500 },
    );
  }

  const { error: companyError } = await supabase
    .from("companies")
    .update({
      name: companyName ?? undefined,
      website: website ?? undefined,
      city: city ?? undefined,
      country: country ?? undefined,
      employee_count_range: body.employeeCount?.trim() || undefined,
      hires_per_year_range: body.hiresPerYear?.trim() || undefined,
    })
    .eq("id", context.companyId);

  if (companyError) {
    return NextResponse.json(
      { success: false, error: companyError.message },
      { status: 500 },
    );
  }

  const { error: recruiterError } = await supabase
    .from("recruiters")
    .update({ recruiter_type: body.recruiterType?.trim() || undefined })
    .eq("id", context.recruiterId);

  if (recruiterError) {
    return NextResponse.json(
      { success: false, error: recruiterError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
