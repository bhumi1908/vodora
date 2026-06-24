import Link from "next/link";
import { redirect } from "next/navigation";

import { ReferenceSharePageClient } from "@/components/share/ReferenceSharePageClient";
import { getCandidateDashboardAccessDeniedRedirect } from "@/lib/auth/access-denied";
import { getAccountType } from "@/lib/auth/account-type";
import { getLoginRedirect } from "@/lib/auth/route-protection";
import { getReferenceSharePath } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

type ReferenceSharePageProps = {
  params: Promise<{ token: string }>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: ReferenceSharePageProps) {
  return {
    title: "Shared Reference Passport — Vodora",
    description: "View a candidate's verified references shared via secure link.",
  };
}

export default async function ReferenceSharePage({ params }: ReferenceSharePageProps) {
  const { token } = await params;
  const shareToken = token.trim();
  const pathname = getReferenceSharePath(shareToken);

  if (!UUID_PATTERN.test(shareToken)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Invalid share link</h1>
        <p className="mt-3 text-sm text-gray-600">
          This link does not look valid. Ask the candidate to send a new one.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(getLoginRedirect(pathname));
  }

  const accountType = await getAccountType(supabase, user);

  if (accountType !== "recruiter") {
    redirect(getCandidateDashboardAccessDeniedRedirect());
  }

  return <ReferenceSharePageClient token={shareToken} />;
}
