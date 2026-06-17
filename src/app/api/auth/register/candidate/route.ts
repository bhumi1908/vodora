import { NextResponse } from "next/server";

import { resolveIndustryCategoryId } from "@/lib/auth/industry";
import { buildCandidateSignupProfile } from "@/lib/auth/registration";
import {
  getRequestOrigin,
  runSignupFlow,
} from "@/lib/auth/signup-flow";
import type { CandidateSignupRequest } from "@/lib/auth/types";
import { validateCandidateSignup } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: Partial<CandidateSignupRequest>;

  try {
    body = (await request.json()) as Partial<CandidateSignupRequest>;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const validationError = validateCandidateSignup(body);
  if (validationError) {
    return NextResponse.json(
      { success: false, error: validationError },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { id: industryCategoryId, error: industryError } =
    await resolveIndustryCategoryId(supabase, body.industry!);

  if (industryError || !industryCategoryId) {
    return NextResponse.json(
      { success: false, error: industryError ?? "Invalid industry." },
      { status: 400 },
    );
  }

  const signupProfile = buildCandidateSignupProfile({
    country: body.country!,
    city: body.city!,
    profession: body.profession!,
    industryCategoryId,
    workTypeCodes: body.workTypeCodes!,
    termsAccepted: body.agreedToTerms!,
  });

  const origin = getRequestOrigin(request);

  const result = await runSignupFlow(supabase, {
    email: body.email!,
    password: body.password!,
    firstName: body.firstName!,
    lastName: body.lastName!,
    signupProfile,
    emailRedirectTo: `${origin}/auth/callback`,
  });

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
