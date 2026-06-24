import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { getCachedCandidatePeerProfile } from "@/lib/candidate/fetch-candidate-peer-profile";
import { fetchCandidatePeerConnectionStatus } from "@/lib/connections/fetch-candidate-peer-connection-status";
import {
  redactPrivateProfileFields,
  resolveProfileVisibility,
} from "@/lib/profile/profile-visibility";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ vodoraId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { vodoraId } = await context.params;
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

  const accountType = await getAccountType(supabase, user);

  if (accountType !== "candidate") {
    return NextResponse.json(
      { success: false, error: "Candidate access required." },
      { status: 403 },
    );
  }

  const profile = await getCachedCandidatePeerProfile(supabase, vodoraId);

  if (!profile) {
    return NextResponse.json(
      { success: false, error: "Candidate not found." },
      { status: 404 },
    );
  }

  const connection = profile.candidateId
    ? await fetchCandidatePeerConnectionStatus(supabase, profile.candidateId)
    : null;

  const visibility = resolveProfileVisibility({
    peerView: true,
    connection,
  });

  const visibleProfile = redactPrivateProfileFields(
    profile,
    visibility.showContactDetails,
  );

  return NextResponse.json({
    success: true,
    profile: visibleProfile,
  });
}
