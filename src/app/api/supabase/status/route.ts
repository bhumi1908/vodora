import { NextResponse } from "next/server";

import { checkSupabaseConnection } from "@/lib/supabase/check-connection";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await checkSupabaseConnection();

  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
