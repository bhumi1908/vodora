import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { respondToConnectionRequest } from "@/lib/connections/respond-to-connection-request";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ connectionId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { connectionId } = await context.params;

  if (!connectionId?.trim()) {
    return NextResponse.json(
      { success: false, error: "Connection id is required." },
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

  if (accountType !== "recruiter") {
    return NextResponse.json(
      { success: false, error: "Recruiter access required." },
      { status: 403 },
    );
  }

  let action: "accept" | "reject" | undefined;

  try {
    const body = (await request.json()) as { action?: unknown };
    if (body.action === "accept" || body.action === "reject") {
      action = body.action;
    }
  } catch {
    action = undefined;
  }

  if (!action) {
    return NextResponse.json(
      { success: false, error: "Valid action is required." },
      { status: 400 },
    );
  }

  const result = await respondToConnectionRequest(
    supabase,
    connectionId,
    action,
  );

  if (result.error) {
    const normalized = result.error.toLowerCase();
    const status = normalized.includes("not found")
      ? 404
      : normalized.includes("not authorized")
        ? 403
        : normalized.includes("not pending")
          ? 409
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
    action: result.action,
  });
}
