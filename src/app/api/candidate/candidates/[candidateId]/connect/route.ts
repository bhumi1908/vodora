import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { sendCandidatePeerConnectionRequest } from "@/lib/connections/send-candidate-peer-connection-request";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ candidateId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
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

  let message: string | undefined;

  try {
    const body = (await request.json()) as { message?: unknown };
    message = typeof body.message === "string" ? body.message : undefined;
  } catch {
    message = undefined;
  }

  const result = await sendCandidatePeerConnectionRequest(
    supabase,
    candidateId,
    message,
  );

  if (result.error) {
    const normalized = result.error.toLowerCase();
    const status = normalized.includes("not found")
      ? 404
      : normalized.includes("authentication")
        ? 401
        : normalized.includes("yourself")
          ? 400
          : 500;

    return NextResponse.json(
      { success: false, error: result.error },
      { status },
    );
  }

  return NextResponse.json({
    success: true,
    id: result.id,
    status: result.status,
    alreadyExists: result.alreadyExists,
  });
}
