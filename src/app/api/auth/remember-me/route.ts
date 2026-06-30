import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  buildRememberMePreferenceCookie,
  readRememberMePreference,
} from "@/lib/auth/session-cookies";
import { createClient } from "@/lib/supabase/server";

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

  const cookieStore = await cookies();
  const rememberMe = readRememberMePreference({
    get(name) {
      return cookieStore.get(name);
    },
  });

  return NextResponse.json({
    success: true,
    rememberMe,
  });
}

export async function PATCH(request: Request) {
  let body: { rememberMe?: unknown };

  try {
    body = (await request.json()) as { rememberMe?: unknown };
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (typeof body.rememberMe !== "boolean") {
    return NextResponse.json(
      { success: false, error: "rememberMe must be true or false." },
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

  const cookie = buildRememberMePreferenceCookie(body.rememberMe);
  const response = NextResponse.json({
    success: true,
    rememberMe: body.rememberMe,
  });

  response.cookies.set(cookie.name, cookie.value, cookie.options);

  return response;
}
