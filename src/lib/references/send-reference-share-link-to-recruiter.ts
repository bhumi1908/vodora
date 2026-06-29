import {
  buildReferenceShareLinkRecruiterEmailHtml,
  buildReferenceShareLinkRecruiterEmailText,
} from "@/lib/email/templates/reference-share-link-recruiter";
import { sendEmail } from "@/lib/email/smtp";
import { fetchConnectedRecruitersForShare } from "@/lib/references/fetch-connected-recruiters-for-share";
import { createReferencePassportShare } from "@/lib/references/reference-passport-shares";
import type {
  ReferencePassportShareItem,
  SendReferenceShareLinkToRecruiterPayload,
} from "@/lib/references/reference-passport-share.types";
import { normalizeReferenceSharePermissions } from "@/lib/references/reference-permissions";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type Supabase = SupabaseClient<Database>;

function formatShareLabel(
  shareType: string,
  includedCount: number,
): string {
  if (shareType === "full_passport" || includedCount === 0) {
    return "Full Reference Passport";
  }

  return `${includedCount} selected reference${includedCount === 1 ? "" : "s"}`;
}

function formatExpiryLabel(expiresAt: string | null): string | null {
  if (!expiresAt) {
    return null;
  }

  const expires = new Date(expiresAt);

  if (Number.isNaN(expires.getTime())) {
    return null;
  }

  return `This link expires on ${expires.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}.`;
}

async function fetchRecruiterEmail(
  supabase: Supabase,
  recruiterId: string,
): Promise<{ email: string | null; name: string; company: string | null }> {
  const { data: recruiter } = await supabase
    .from("recruiters")
    .select("user_id, company_id")
    .eq("id", recruiterId)
    .maybeSingle();

  if (!recruiter?.user_id) {
    return { email: null, name: "Recruiter", company: null };
  }

  const [{ data: user }, { data: company }] = await Promise.all([
    supabase
      .from("users")
      .select("first_name, last_name, email")
      .eq("id", recruiter.user_id)
      .maybeSingle(),
    recruiter.company_id
      ? supabase
          .from("companies")
          .select("name")
          .eq("id", recruiter.company_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    email: user?.email?.trim() || null,
    name: [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() || "Recruiter",
    company: company?.name ?? null,
  };
}

async function fetchCandidateName(
  supabase: Supabase,
  userId: string,
): Promise<string> {
  const { data: user } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", userId)
    .maybeSingle();

  return (
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    "A candidate"
  );
}

export async function sendReferenceShareLinkToRecruiter(
  supabase: Supabase,
  candidateId: string,
  userId: string,
  payload: SendReferenceShareLinkToRecruiterPayload,
  origin?: string,
): Promise<{ share: ReferencePassportShareItem | null; error?: string }> {
  const recruitersResult = await fetchConnectedRecruitersForShare(supabase);

  if (recruitersResult.error) {
    return { share: null, error: recruitersResult.error };
  }

  const connectedRecruiter = recruitersResult.recruiters.find(
    (recruiter) => recruiter.recruiterId === payload.recruiterId,
  );

  if (!connectedRecruiter) {
    return {
      share: null,
      error: "Select a connected recruiter before sending the link.",
    };
  }

  const recruiterContact = await fetchRecruiterEmail(supabase, payload.recruiterId);

  if (!recruiterContact.email) {
    return {
      share: null,
      error: "Unable to find an email address for this recruiter.",
    };
  }

  const includedReferenceIds = Array.isArray(payload.includedReferenceIds)
    ? payload.includedReferenceIds.filter(
        (value): value is string => typeof value === "string" && value.length > 0,
      )
    : undefined;

  const expiresInDays =
    typeof payload.expiresInDays === "number" && Number.isFinite(payload.expiresInDays)
      ? Math.max(0, Math.floor(payload.expiresInDays))
      : null;

  const shareResult = await createReferencePassportShare(
    supabase,
    candidateId,
    {
      shareType: payload.shareType,
      includedReferenceIds,
      permissions: normalizeReferenceSharePermissions(payload.permissions),
      expiresInDays,
    },
    origin,
  );

  if (shareResult.error || !shareResult.share) {
    return {
      share: null,
      error: shareResult.error ?? "Unable to create share link.",
    };
  }

  const candidateName = await fetchCandidateName(supabase, userId);
  const shareLabel = formatShareLabel(
    shareResult.share.shareType,
    shareResult.share.includedReferenceIds.length,
  );
  const expiryLabel = formatExpiryLabel(shareResult.share.expiresAt);

  const emailResult = await sendEmail({
    to: recruiterContact.email,
    subject: `${candidateName} shared references with you on Vodora`,
    html: buildReferenceShareLinkRecruiterEmailHtml({
      shareUrl: shareResult.share.shareUrl,
      candidateName,
      recruiterName: recruiterContact.name,
      shareLabel,
      expiryLabel,
    }),
    text: buildReferenceShareLinkRecruiterEmailText({
      shareUrl: shareResult.share.shareUrl,
      candidateName,
      recruiterName: recruiterContact.name,
      shareLabel,
      expiryLabel,
    }),
  });

  if (!emailResult.success) {
    return {
      share: shareResult.share,
      error: emailResult.error ?? "Unable to send share link email.",
    };
  }

  return { share: shareResult.share };
}
