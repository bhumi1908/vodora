import { NextResponse } from "next/server";

import { fetchCompanyInvitations } from "@/lib/recruiter/fetch-company-invitations";
import { COMPANY_INVITATION_ROLE_OPTIONS } from "@/lib/recruiter/hiring-preferences";
import { requireOwnRecruiter } from "@/lib/recruiter/require-own-recruiter";
import { createClient } from "@/lib/supabase/server";
import { getEmailFormatError } from "@/lib/email/validate-email";

const INVITATION_ROLES = COMPANY_INVITATION_ROLE_OPTIONS.map(
  (option) => option.value,
);

type InvitationPayload = {
  email?: string;
  teamRole?: string;
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  const invitations = await fetchCompanyInvitations(supabase);

  return NextResponse.json({
    success: true,
    invitations,
  });
}

export async function POST(request: Request) {
  let body: InvitationPayload;

  try {
    body = (await request.json()) as InvitationPayload;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const teamRole = body.teamRole?.trim() || "member";

  if (!email) {
    return NextResponse.json(
      { success: false, error: "Email address is required." },
      { status: 400 },
    );
  }

  const formatError = getEmailFormatError(email);

  if (formatError) {
    return NextResponse.json(
      { success: false, error: formatError },
      { status: 400 },
    );
  }

  if (!(INVITATION_ROLES as readonly string[]).includes(teamRole)) {
    return NextResponse.json(
      { success: false, error: "Select a valid team role." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const context = await requireOwnRecruiter(supabase);

  if (!context) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  if (!context.companyId) {
    return NextResponse.json(
      { success: false, error: "No company linked to this recruiter." },
      { status: 404 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  if (user.email?.toLowerCase() === email) {
    return NextResponse.json(
      { success: false, error: "You cannot invite yourself." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("company_invitations")
    .insert({
      company_id: context.companyId,
      email,
      team_role: teamRole,
      invited_by: user.id,
      status: "pending",
    })
    .select("id, email, team_role, status, created_at, expires_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          error: "This email already has a pending invitation.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    invitation: {
      id: data.id,
      email: data.email,
      teamRole: data.team_role,
      status: data.status,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
    },
  });
}
