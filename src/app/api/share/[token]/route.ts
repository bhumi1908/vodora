import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { openReferenceShareLink } from "@/lib/references/open-reference-share-link";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ token: string }>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const shareToken = token.trim();

  if (!UUID_PATTERN.test(shareToken)) {
    return NextResponse.json(
      { success: false, error: "Invalid share link." },
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

  const result = await openReferenceShareLink(supabase, shareToken);

  if (result.error || !result.result) {
    const status = result.error?.includes("Sign in") ? 401 : 404;
    return NextResponse.json(
      { success: false, error: result.error ?? "Unable to open share link." },
      { status },
    );
  }

  return NextResponse.json({
    success: true,
    data: result.result,
  });
}
