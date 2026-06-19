import type { SupabaseClient } from "@supabase/supabase-js";

import type { CompanyInvitationRecord } from "@/lib/recruiter/company-invitation.types";
import { fetchCompanyInvitations } from "@/lib/recruiter/fetch-company-invitations";
import { getCachedOwnRecruiterProfileRaw } from "@/lib/recruiter/fetch-own-recruiter-profile";
import {
  transformOwnRecruiterProfileToEdit,
  type RecruiterProfileEditData,
} from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export type RecruiterWelcomeData = {
  profile: RecruiterProfileEditData;
  emailVerified: boolean;
  invitations: CompanyInvitationRecord[];
};

export async function getRecruiterWelcomeData(
  supabase: Supabase,
): Promise<RecruiterWelcomeData | null> {
  const rawProfile = await getCachedOwnRecruiterProfileRaw(supabase);
  const profile = rawProfile
    ? transformOwnRecruiterProfileToEdit(rawProfile)
    : null;

  if (!profile || !rawProfile?.user) {
    return null;
  }

  const invitations = await fetchCompanyInvitations(supabase);

  return {
    profile,
    emailVerified: Boolean(rawProfile.user.email_verified_at),
    invitations,
  };
}
