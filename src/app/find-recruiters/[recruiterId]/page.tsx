import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CandidateRecruiterProfileWithCache } from "@/components/recruiter/CandidateRecruiterProfileWithCache";
import { getRecruiterDashboardAccessDeniedRedirect } from "@/lib/auth/access-denied";
import { getAccountType } from "@/lib/auth/account-type";
import { getRouteProtectionRedirect } from "@/lib/auth/route-protection";
import {
  CANDIDATE_FIND_RECRUITERS_PATH,
  getCandidateRecruiterProfilePath,
} from "@/lib/auth/routes";
import { getCachedCandidateRecruiterProfile } from "@/lib/recruiter/fetch-candidate-recruiter-profile";
import {
  redactPrivateRecruiterProfileFields,
  resolveRecruiterProfileVisibility,
} from "@/lib/recruiter/recruiter-profile-visibility";
import { createClient } from "@/lib/supabase/server";

type CandidateRecruiterProfilePageProps = {
  params: Promise<{ recruiterId: string }>;
};

export async function generateMetadata({
  params,
}: CandidateRecruiterProfilePageProps) {
  const { recruiterId } = await params;
  const supabase = await createClient();
  const profile = await getCachedCandidateRecruiterProfile(supabase, recruiterId);

  return {
    title: profile
      ? `${profile.name} — Recruiter Profile — Vodora`
      : "Recruiter Profile — Vodora",
    description: profile?.title
      ? `View ${profile.name}'s recruiter profile on Vodora.`
      : "View recruiter profile on Vodora.",
  };
}

export default async function CandidateRecruiterProfilePage({
  params,
}: CandidateRecruiterProfilePageProps) {
  const { recruiterId } = await params;
  const supabase = await createClient();
  const pathname = getCandidateRecruiterProfilePath(recruiterId);
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

  const profile = await getCachedCandidateRecruiterProfile(supabase, recruiterId);

  if (!profile) {
    notFound();
  }

  const connection = profile.connection;

  const visibility = resolveRecruiterProfileVisibility({
    candidateView: true,
    connection,
  });

  const visibleProfile = redactPrivateRecruiterProfileFields(
    profile,
    visibility.showContactDetails,
  );

  return (
    <>
      <div className="mx-auto max-w-5xl px-3 pt-4 sm:px-6 sm:pt-6">
        <Link
          href={CANDIDATE_FIND_RECRUITERS_PATH}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          Back to find recruiters
        </Link>
      </div>
      <CandidateRecruiterProfileWithCache
        recruiterId={recruiterId}
        initialProfile={visibleProfile}
      />
    </>
  );
}
