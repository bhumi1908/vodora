import { NextResponse } from "next/server";

import { buildRecruiterSignupProfile } from "@/lib/auth/registration";
import {
  getRequestOrigin,
  runSignupFlow,
} from "@/lib/auth/signup-flow";
import type { RecruiterSignupRequest } from "@/lib/auth/types";
import { validateRecruiterSignup } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: Partial<RecruiterSignupRequest>;

  try {
    body = (await request.json()) as Partial<RecruiterSignupRequest>;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const validationError = validateRecruiterSignup(body);
  if (validationError) {
    return NextResponse.json(
      { success: false, error: validationError },
      { status: 400 },
    );
  }

  const signupProfile = buildRecruiterSignupProfile({
    country: body.country!,
    city: body.city!,
    companyName: body.companyName!,
    jobTitle: body.position!,
    website: body.website!,
    employeeCountRange: body.employeeCount!,
    hiresPerYearRange: body.hiresPerYear!,
    recruiterType: body.recruiterType!,
    termsAccepted: body.agreedToTerms!,
  });

  const origin = getRequestOrigin(request);
  const supabase = await createClient();

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
