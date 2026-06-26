import { NextResponse } from "next/server";

import { buildCandidateSignupProfile } from "@/lib/auth/registration";
import { getSignupEmailStatus } from "@/lib/auth/check-signup-email";
import {
  getRequestOrigin,
  runSignupFlow,
} from "@/lib/auth/signup-flow";
import type { CandidateSignupRequest } from "@/lib/auth/types";
import { validateCandidateSignup } from "@/lib/auth/validation";
import { resolveIndustryCategoryId } from "@/lib/auth/industry";
import { resolveJobTitleForSignup } from "@/lib/job-titles/resolve-job-title";
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

  const { jobTitle, error: jobTitleError } = await resolveJobTitleForSignup(
    body.jobTitleId!,
  );

  if (jobTitleError || !jobTitle) {
    return NextResponse.json(
      { success: false, error: jobTitleError ?? "Invalid job title." },
      { status: 400 },
    );
  }

  let industryCategoryId = jobTitle.industryCategoryId;

  if (!industryCategoryId) {
    const { id, error: industryError } = await resolveIndustryCategoryId(
      supabase,
      "other",
    );

    if (industryError || !id) {
      return NextResponse.json(
        {
          success: false,
          error: industryError ?? "Unable to resolve industry category.",
        },
        { status: 400 },
      );
    }

    industryCategoryId = id;
  }

  const signupProfile = buildCandidateSignupProfile({
    country: body.country!,
    city: body.city!,
    profession: jobTitle.name,
    industryCategoryId,
    jobTitleId: jobTitle.id,
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
    origin,
    redirect: body.redirect,
  });

  if (!result.success) {
    const normalizedError = result.error?.toLowerCase() ?? "";

    if (normalizedError.includes("already exists")) {
      const status = await getSignupEmailStatus(body.email!);

      if (status.code === "invited_reference_stub") {
        return NextResponse.json(
          {
            success: false,
            code: "invited_reference_stub",
            recruiterName: status.recruiterName,
            companyName: status.companyName,
            error:
              "A Vodora profile was already started for this email when a recruiter began collecting your reference.",
          },
          { status: 409 },
        );
      }

      if (status.code === "recruiter_account") {
        return NextResponse.json(
          {
            success: false,
            code: "recruiter_account",
            error:
              "This email is registered as a recruiter account. Sign in as a recruiter instead.",
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          code: "email_already_registered",
          error:
            "An account with this email already exists. Sign in instead.",
        },
        { status: 409 },
      );
    }
  }

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
