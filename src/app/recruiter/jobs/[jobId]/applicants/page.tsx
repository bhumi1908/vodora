import { redirect } from "next/navigation";

import { RecruiterJobApplicantsPage } from "@/components/recruiter/applications/RecruiterJobApplicantsPage";
import { getCandidateDashboardAccessDeniedRedirect } from "@/lib/auth/access-denied";
import { getAccountType } from "@/lib/auth/account-type";
import { getRouteProtectionRedirect } from "@/lib/auth/route-protection";
import { getRecruiterJobApplicantsPath } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

type RecruiterJobApplicantsRouteProps = {
  params: Promise<{ jobId: string }>;
};

export async function generateMetadata({ params }: RecruiterJobApplicantsRouteProps) {
  const { jobId } = await params;

  return {
    title: "Applicants — Vodora",
    description: `Review candidates who applied to role ${jobId}.`,
  };
}

export default async function RecruiterJobApplicantsRoute({
  params,
}: RecruiterJobApplicantsRouteProps) {
  const { jobId } = await params;
  const supabase = await createClient();
  const pathname = getRecruiterJobApplicantsPath(jobId);
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

  return <RecruiterJobApplicantsPage jobId={jobId} />;
}
