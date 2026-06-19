import type { SupabaseClient } from "@supabase/supabase-js";

import type { CompanyInvitationRecord } from "@/lib/recruiter/company-invitation.types";
import { requireOwnRecruiter } from "@/lib/recruiter/require-own-recruiter";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

function mapInvitationRow(row: {
  id: string;
  email: string;
  team_role: string;
  status: string;
  created_at: string;
  expires_at: string;
}): CompanyInvitationRecord {
  return {
    id: row.id,
    email: row.email,
    teamRole: row.team_role,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

export async function fetchCompanyInvitations(
  supabase: Supabase,
): Promise<CompanyInvitationRecord[]> {
  const context = await requireOwnRecruiter(supabase);

  if (!context?.companyId) {
    return [];
  }

  const { data, error } = await supabase
    .from("company_invitations")
    .select("id, email, team_role, status, created_at, expires_at")
    .eq("company_id", context.companyId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map(mapInvitationRow);
}
