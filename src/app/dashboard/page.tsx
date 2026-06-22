import { redirect } from "next/navigation";
import Link from "next/link";

import { getRecruiterDashboardAccessDeniedRedirect } from "@/lib/auth/access-denied";
import { getAccountType } from "@/lib/auth/account-type";
import { getRouteProtectionRedirect } from "@/lib/auth/route-protection";
import {
  CANDIDATE_CONNECTIONS_PATH,
  CANDIDATE_FIND_CANDIDATES_PATH,
  CANDIDATE_FIND_RECRUITERS_PATH,
  CANDIDATE_JOBS_PATH,
} from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard — Vodora",
  description: "Candidate dashboard.",
};

export default async function CandidateDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    "/dashboard",
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  const accountType = user ? await getAccountType(supabase, user) : null;

  if (accountType !== "candidate") {
    redirect(getRecruiterDashboardAccessDeniedRedirect());
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-semibold text-gray-900">
        Candidate Dashboard
      </h1>
      <p className="mb-8 text-gray-600">
        Welcome back. Explore the directory and grow your network.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href={CANDIDATE_FIND_CANDIDATES_PATH}
          className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            Find Candidates
          </h2>
          <p className="text-sm text-gray-600">
            Browse verified professionals and connect with peers.
          </p>
        </Link>
        <Link
          href={CANDIDATE_FIND_RECRUITERS_PATH}
          className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            Find Recruiters
          </h2>
          <p className="text-sm text-gray-600">
            Discover recruiters and explore open roles.
          </p>
        </Link>
        <Link
          href={CANDIDATE_CONNECTIONS_PATH}
          className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            Connections
          </h2>
          <p className="text-sm text-gray-600">
            Manage your connection requests and network.
          </p>
        </Link>
        <Link
          href={CANDIDATE_JOBS_PATH}
          className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            Search for Jobs
          </h2>
          <p className="text-sm text-gray-600">
            Browse published roles and apply directly.
          </p>
        </Link>
        <Link
          href="/my-profile"
          className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            My Profile
          </h2>
          <p className="text-sm text-gray-600">
            View and update your verified profile.
          </p>
        </Link>
      </div>
    </div>
  );
}
