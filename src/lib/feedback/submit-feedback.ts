import type { SupabaseClient } from "@supabase/supabase-js";

import {
  type FeedbackPayload,
  validateFeedback,
} from "@/lib/feedback/validation";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export type SubmitFeedbackResult = {
  success: boolean;
  alreadySubmitted: boolean;
  error: string | null;
};

export async function submitFeedback(
  supabase: Supabase,
  userId: string,
  payload: FeedbackPayload,
): Promise<SubmitFeedbackResult> {
  const validationError = validateFeedback(payload);

  if (validationError) {
    return {
      success: false,
      alreadySubmitted: false,
      error: validationError,
    };
  }

  const { data: existing } = await supabase
    .from("user_feedback")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      alreadySubmitted: true,
      error: "You have already filled out this form.",
    };
  }

  const { error } = await supabase.from("user_feedback").insert({
    user_id: userId,
    role: payload.role.trim(),
    overall_rating: payload.overallRating,
    feedback_type: payload.feedbackType,
    selected_feature: payload.selectedFeature?.trim() || null,
    details: payload.details.trim(),
    new_feature_title: payload.newFeatureTitle?.trim() || null,
    new_feature_desc: payload.newFeatureDesc?.trim() || null,
    contact_email: payload.canContact ? payload.email?.trim() || null : null,
    can_contact: payload.canContact,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        alreadySubmitted: true,
        error: "You have already filled out this form.",
      };
    }

    return {
      success: false,
      alreadySubmitted: false,
      error: error.message,
    };
  }

  return {
    success: true,
    alreadySubmitted: false,
    error: null,
  };
}
