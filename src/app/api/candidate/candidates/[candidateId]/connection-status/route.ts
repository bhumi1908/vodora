import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { fetchCandidatePeerConnectionStatus } from "@/lib/connections/fetch-candidate-peer-connection-status";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ candidateId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { candidateId } = await context.params;

  if (!candidateId?.trim()) {
    return NextResponse.json(
      { success: false, error: "Candidate id is required." },
      { status: 400 },
    );
  }

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

  const connection = await fetchCandidatePeerConnectionStatus(
    supabase,
    candidateId,
  );

  return NextResponse.json({
    success: true,
    connection,
  });
}
