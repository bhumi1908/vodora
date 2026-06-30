import { NextResponse } from "next/server";

import { deleteNotification } from "@/lib/notifications/delete-notification";
import { markNotificationRead } from "@/lib/notifications/mark-notification-read";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: { read?: boolean };

  try {
    body = (await request.json()) as { read?: boolean };
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (body.read !== true && body.read !== false) {
    return NextResponse.json(
      { success: false, error: "read must be true or false." },
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

  const result = await markNotificationRead(supabase, id, body.read);

  if (!result.success) {
    const status = result.error === "Notification not found." ? 404 : 500;

    return NextResponse.json(
      { success: false, error: result.error ?? "Could not update notification." },
      { status },
    );
  }

  return NextResponse.json({ success: true, read: body.read });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
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

  const result = await deleteNotification(supabase, id);

  if (!result.success) {
    const status = result.error === "Notification not found." ? 404 : 500;

    return NextResponse.json(
      { success: false, error: result.error ?? "Could not delete notification." },
      { status },
    );
  }

  return NextResponse.json({ success: true });
}
