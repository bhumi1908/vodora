import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { CandidateSettingsPageClient } from "@/components/settings/CandidateSettingsPageClient";
import { RecruiterSettingsPageClient } from "@/components/settings/RecruiterSettingsPageClient";
import { getAccountType } from "@/lib/auth/account-type";
import {
  getLoginRedirect,
  getRouteProtectionRedirect,
} from "@/lib/auth/route-protection";
import { readRememberMePreference } from "@/lib/auth/session-cookies";
import { fetchCompanyInvitations } from "@/lib/recruiter/fetch-company-invitations";
import { fetchCandidateSettings } from "@/lib/settings/fetch-candidate-settings";
import { parseSettingsSection } from "@/lib/settings/parse-settings-section";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Settings — Vodora",
  description: "Manage your Vodora account settings.",
};

type SettingsPageProps = {
  searchParams: Promise<{ section?: string }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { section: sectionParam } = await searchParams;
  const defaultSectionId = parseSettingsSection(sectionParam) ?? undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = await getRouteProtectionRedirect(
    supabase,
    user,
    "/settings",
  );

  if (redirectPath) {
    redirect(redirectPath);
  }

  if (!user) {
    redirect(getLoginRedirect("/settings"));
  }

  const accountType = await getAccountType(supabase, user);
  const cookieStore = await cookies();
  const rememberMe = readRememberMePreference({
    get(name) {
      return cookieStore.get(name);
    },
  });

  const { data: userRow } = await supabase
    .from("users")
    .select("email, email_verified_at")
    .eq("id", user.id)
    .maybeSingle();

  const email = userRow?.email ?? user.email ?? "";
  const emailVerified = Boolean(userRow?.email_verified_at);

  if (accountType === "recruiter") {
    const invitations = await fetchCompanyInvitations(supabase);

    return (
      <RecruiterSettingsPageClient
        initialInvitations={invitations}
        initialRememberMe={rememberMe}
        email={email}
        emailVerified={emailVerified}
        defaultSectionId={defaultSectionId}
      />
    );
  }

  const settings = await fetchCandidateSettings(supabase);

  if (!settings) {
    redirect(getLoginRedirect("/settings"));
  }

  return (
    <CandidateSettingsPageClient
      initialSettings={settings}
      initialRememberMe={rememberMe}
      email={email}
      emailVerified={emailVerified}
      defaultSectionId={defaultSectionId}
    />
  );
}
