import { NextResponse } from "next/server";

import { fetchCandidateSettings } from "@/lib/settings/fetch-candidate-settings";
import {
  validateCandidateSettingsPayload,
  type CandidateSettingsPayload,
} from "@/lib/settings/candidate-settings-validation";
import { requireOwnCandidate } from "@/lib/profile/require-own-candidate";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const settings = await fetchCandidateSettings(supabase);

  if (!settings) {
    return NextResponse.json(
      { success: false, error: "Could not load settings." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    settings,
  });
}

export async function PATCH(request: Request) {
  let body: CandidateSettingsPayload;

  try {
    body = (await request.json()) as CandidateSettingsPayload;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const validationError = validateCandidateSettingsPayload(body);

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

  const update: {
    visibility?: string;
    default_cover_letter?: string | null;
  } = {};

  if (body.visibility !== undefined) {
    update.visibility = body.visibility;
  }

  if (body.defaultCoverLetter !== undefined) {
    const trimmed = body.defaultCoverLetter?.trim() ?? "";
    update.default_cover_letter = trimmed || null;
  }

  const { error } = await supabase
    .from("candidates")
    .update(update)
    .eq("id", context.candidateId);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
