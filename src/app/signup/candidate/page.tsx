import type { Metadata } from "next";

import { CandidateSignupPage } from "@/components/auth/CandidateSignupPage";
import { redirectIfAuthenticated } from "@/lib/auth/guest-page-guard";
import { getCachedJobTitleOptionGroups } from "@/lib/job-titles/fetch-job-titles";
import type { JobTitleOptionGroup } from "@/lib/job-titles/types";

export const metadata: Metadata = {
  title: "Create Candidate Account — Vodora",
  description: "Create your Vodora candidate account and build your professional reputation",
};

export default async function CandidateSignupRoute({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; email?: string }>;
}) {
  const params = await searchParams;
  await redirectIfAuthenticated(params.redirect);

  let jobTitleOptionGroups: JobTitleOptionGroup[] | undefined;

  try {
    const groups = await getCachedJobTitleOptionGroups();
    if (groups.length > 0) {
      jobTitleOptionGroups = groups;
    }
  } catch (error) {
    console.error("Failed to prefetch job titles for signup:", error);
  }

  return (
    <CandidateSignupPage
      initialEmail={params.email}
      redirectAfterSignup={params.redirect}
      jobTitleOptionGroups={jobTitleOptionGroups}
    />
  );
}
