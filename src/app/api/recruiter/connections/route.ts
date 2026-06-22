import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import type { ConnectionTab } from "@/lib/connections/connection.types";
import { fetchRecruiterConnections } from "@/lib/connections/fetch-recruiter-connections";
import { createClient } from "@/lib/supabase/server";

function parseTab(value: string | null): ConnectionTab {
  if (value === "sent" || value === "connected") {
    return value;
  }

  return "received";
}

function parsePagination(url: URL): { page: number; limit: number } {
  const rawPage = Number(url.searchParams.get("page") ?? "1");
  const rawLimit = Number(url.searchParams.get("limit") ?? "10");

  return {
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
    limit: Number.isFinite(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : 10,
  };
}

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const tab = parseTab(url.searchParams.get("tab"));
  const { page, limit } = parsePagination(url);

  const result = await fetchRecruiterConnections(supabase, tab, page, limit);

  if (result.error) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    ...result,
  });
}
