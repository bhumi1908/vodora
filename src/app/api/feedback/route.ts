import { NextResponse } from "next/server";

import {
  type FeedbackPayload,
  type FeedbackType,
} from "@/lib/feedback/validation";
import { submitFeedback } from "@/lib/feedback/submit-feedback";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  const { data: existing, error } = await supabase
    .from("user_feedback")
    .select("id, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    hasSubmitted: Boolean(existing),
    submittedAt: existing?.created_at ?? null,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  let body: Partial<FeedbackPayload>;

  try {
    body = (await request.json()) as Partial<FeedbackPayload>;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const payload: FeedbackPayload = {
    role: typeof body.role === "string" ? body.role : "",
    overallRating:
      typeof body.overallRating === "number" ? body.overallRating : 0,
    feedbackType:
      typeof body.feedbackType === "string"
        ? (body.feedbackType as FeedbackType)
        : "working",
    selectedFeature:
      typeof body.selectedFeature === "string" ? body.selectedFeature : undefined,
    details: typeof body.details === "string" ? body.details : "",
    newFeatureTitle:
      typeof body.newFeatureTitle === "string" ? body.newFeatureTitle : undefined,
    newFeatureDesc:
      typeof body.newFeatureDesc === "string" ? body.newFeatureDesc : undefined,
    email: typeof body.email === "string" ? body.email : undefined,
    canContact: Boolean(body.canContact),
  };

  const result = await submitFeedback(supabase, user.id, payload);

  if (result.alreadySubmitted) {
    return NextResponse.json(
      { success: false, error: result.error, alreadySubmitted: true },
      { status: 409 },
    );
  }

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
