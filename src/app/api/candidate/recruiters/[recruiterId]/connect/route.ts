import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { sendCandidateConnectionRequest } from "@/lib/connections/send-candidate-connection-request";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ recruiterId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { recruiterId } = await context.params;

  if (!recruiterId?.trim()) {
    return NextResponse.json(
      { success: false, error: "Recruiter id is required." },
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

  const result = await sendCandidateConnectionRequest(
    supabase,
    recruiterId,
    message,
  );

  if (result.error) {
    const normalized = result.error.toLowerCase();
    const status = normalized.includes("not found")
      ? 404
      : normalized.includes("authentication")
        ? 401
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
