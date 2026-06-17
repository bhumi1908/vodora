import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ProfilePage } from "@/components/profile/ProfilePage";
import { getAccountType } from "@/lib/auth/account-type";
import { getRouteProtectionRedirect } from "@/lib/auth/route-protection";
import {
  getRecruiterCandidateProfilePath,
  RECRUITER_DASHBOARD_PATH,
} from "@/lib/auth/routes";
import { getCachedRecruiterCandidateProfile } from "@/lib/recruiter/fetch-recruiter-candidate-profile";
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
    redirect("/dashboard");
  }

  const profile = await getCachedRecruiterCandidateProfile(supabase, vodoraId);

  if (!profile) {
    notFound();
  }

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <Link
          href={RECRUITER_DASHBOARD_PATH}
          className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to dashboard
        </Link>
      </div>
      <ProfilePage profile={profile} recruiterView />
    </>
  );
}
