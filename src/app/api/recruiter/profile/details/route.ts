import { NextResponse } from "next/server";

import { validateRecruiterDetails } from "@/lib/recruiter/profile-validation";
import { requireOwnRecruiter } from "@/lib/recruiter/require-own-recruiter";
import { createClient } from "@/lib/supabase/server";

type DetailsPayload = {
  title?: string;
  phone?: string;
  city?: string;
  country?: string;
};

export async function PATCH(request: Request) {
  let body: DetailsPayload;

  try {
    body = (await request.json()) as DetailsPayload;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const validationError = validateRecruiterDetails({
    title: body.title ?? "",
    phone: body.phone ?? "",
    city: body.city ?? "",
    country: body.country ?? "",
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

  const phone = body.phone?.trim() || null;
  const city = body.city?.trim() || null;
  const country = body.country?.trim() || null;
  const title = body.title?.trim() || null;

  const { error: userError } = await supabase
    .from("users")
    .update({ phone, city, country })
    .eq("id", context.userId);

  if (userError) {
    return NextResponse.json(
      { success: false, error: userError.message },
      { status: 500 },
    );
  }

  const { error: recruiterError } = await supabase
    .from("recruiters")
    .update({ job_title: title ?? undefined })
    .eq("id", context.recruiterId);

  if (recruiterError) {
    return NextResponse.json(
      { success: false, error: recruiterError.message },
      { status: 500 },
    );
  }

  if (context.companyId) {
    const { error: companyError } = await supabase
      .from("companies")
      .update({ city, country })
      .eq("id", context.companyId);

    if (companyError) {
      return NextResponse.json(
        { success: false, error: companyError.message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true });
}
