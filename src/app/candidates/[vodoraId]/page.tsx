import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CandidatePeerProfileWithCache } from "@/components/candidate-directory/CandidatePeerProfileWithCache";
import { getRecruiterDashboardAccessDeniedRedirect } from "@/lib/auth/access-denied";
import { getAccountType } from "@/lib/auth/account-type";
import { getRouteProtectionRedirect } from "@/lib/auth/route-protection";
import {
  CANDIDATE_FIND_CANDIDATES_PATH,
  getCandidatePeerProfilePath,
} from "@/lib/auth/routes";
import { getCachedCandidatePeerProfile } from "@/lib/candidate/fetch-candidate-peer-profile";
import { fetchCandidatePeerConnectionStatus } from "@/lib/connections/fetch-candidate-peer-connection-status";
import {
  redactPrivateProfileFields,
  resolveProfileVisibility,
} from "@/lib/profile/profile-visibility";
import { createClient } from "@/lib/supabase/server";

type CandidatePeerProfilePageProps = {
  params: Promise<{ vodoraId: string }>;
};

export async function generateMetadata({
  params,
}: CandidatePeerProfilePageProps) {
  const { vodoraId } = await params;
  const supabase = await createClient();
  const profile = await getCachedCandidatePeerProfile(supabase, vodoraId);

  return {
    title: profile
      ? `${profile.name} — Candidate Profile — Vodora`
      : "Candidate Profile — Vodora",
    description: profile?.title
      ? `View ${profile.name}'s verified Vodora profile.`
      : "View candidate profile on Vodora.",
  };
}

export default async function CandidatePeerProfilePage({
  params,
}: CandidatePeerProfilePageProps) {
  const { vodoraId } = await params;
  const supabase = await createClient();
  const pathname = getCandidatePeerProfilePath(vodoraId);
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

  if (accountType !== "candidate") {
    redirect(getRecruiterDashboardAccessDeniedRedirect());
  }

  const profile = await getCachedCandidatePeerProfile(supabase, vodoraId);

  if (!profile) {
    notFound();
  }

  const connection = profile.candidateId
    ? await fetchCandidatePeerConnectionStatus(supabase, profile.candidateId)
    : null;

  const visibility = resolveProfileVisibility({
    peerView: true,
    connection,
  });

  const visibleProfile = redactPrivateProfileFields(
    profile,
    visibility.showContactDetails,
  );

  return (
    <>
      <div className="mx-auto max-w-5xl px-3 pt-4 sm:px-6 sm:pt-6">
        <Link
          href={CANDIDATE_FIND_CANDIDATES_PATH}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          Back to find candidates
        </Link>
      </div>
      <CandidatePeerProfileWithCache
        vodoraId={vodoraId}
        initialProfile={visibleProfile}
      />
    </>
  );
}
