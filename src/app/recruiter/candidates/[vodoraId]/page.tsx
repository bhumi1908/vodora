import { after } from "next/server";
import { notFound, redirect } from "next/navigation";

import { RecruiterCandidateProfileViewTracker } from "@/components/recruiter/RecruiterCandidateProfileViewTracker";
import { RecruiterCandidateProfileWithCache } from "@/components/recruiter/RecruiterCandidateProfileWithCache";
import { getCandidateDashboardAccessDeniedRedirect } from "@/lib/auth/access-denied";
import { getAccountType } from "@/lib/auth/account-type";
import { getRouteProtectionRedirect } from "@/lib/auth/route-protection";
import { NavigationBackLink } from "@/components/ui/NavigationBackLink";
import {
  getRecruiterCandidateProfilePath,
  RECRUITER_SEARCH_PATH,
} from "@/lib/auth/routes";
import { fetchRecruiterCandidateConnectionStatus } from "@/lib/connections/fetch-recruiter-candidate-connection-status";
import { checkRecruiterReferenceGrant } from "@/lib/references/check-recruiter-reference-grant";
import {
  redactPrivateProfileFields,
  resolveProfileVisibility,
} from "@/lib/profile/profile-visibility";
import { fetchRecruiterCandidateSavedStatus } from "@/lib/recruiter/fetch-candidate-save-status";
import { getCachedRecruiterCandidateProfile } from "@/lib/recruiter/fetch-recruiter-candidate-profile";
import { recordRecruiterCandidateProfileView } from "@/lib/recruiter/recruiter-candidate-profile-views";
import { createClient } from "@/lib/supabase/server";

type RecruiterCandidateProfilePageProps = {
  params: Promise<{ vodoraId: string }>;
};

export async function generateMetadata({
  params,
}: RecruiterCandidateProfilePageProps) {
  const { vodoraId } = await params;
  const supabase = await createClient();
  const profile = await getCachedRecruiterCandidateProfile(supabase, vodoraId);

  return {
    title: profile
      ? `${profile.name} — Candidate Profile — Vodora`
      : "Candidate Profile — Vodora",
    description: profile?.title
      ? `View ${profile.name}'s verified Vodora profile.`
      : "View candidate profile on Vodora.",
  };
}

export default async function RecruiterCandidateProfilePage({
  params,
}: RecruiterCandidateProfilePageProps) {
  const { vodoraId } = await params;
  const supabase = await createClient();
  const pathname = getRecruiterCandidateProfilePath(vodoraId);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    pathname,
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  const accountType = user ? await getAccountType(supabase, user) : null;

  if (accountType !== "recruiter") {
    redirect(getCandidateDashboardAccessDeniedRedirect());
  }

  const profile = await getCachedRecruiterCandidateProfile(supabase, vodoraId);

  if (!profile) {
    notFound();
  }

  const connection = profile.candidateId
    ? await fetchRecruiterCandidateConnectionStatus(supabase, profile.candidateId)
    : null;

  const hasReferenceAccess = profile.candidateId
    ? await checkRecruiterReferenceGrant(supabase, profile.candidateId)
    : false;

  const isSaved = profile.candidateId
    ? await fetchRecruiterCandidateSavedStatus(supabase, profile.candidateId)
    : false;

  const visibility = resolveProfileVisibility({
    recruiterView: true,
    connection,
    hasReferenceAccess,
  });

  const visibleProfile = redactPrivateProfileFields(
    profile,
    visibility.showContactDetails,
  );

  if (profile.candidateId) {
    after(async () => {
      try {
        await recordRecruiterCandidateProfileView(supabase, profile.candidateId!);
      } catch (recordError) {
        console.error("Failed to record candidate profile view:", recordError);
      }
    });
  }

  return (
    <>
      <RecruiterCandidateProfileViewTracker />
      <div className="mx-auto max-w-5xl px-3 pt-4 sm:px-6 sm:pt-6">
        <NavigationBackLink fallbackHref={RECRUITER_SEARCH_PATH} />
      </div>
      <RecruiterCandidateProfileWithCache
        vodoraId={vodoraId}
        initialProfile={visibleProfile}
        initialHasReferenceAccess={hasReferenceAccess}
        initialIsSaved={isSaved}
      />
    </>
  );
}
