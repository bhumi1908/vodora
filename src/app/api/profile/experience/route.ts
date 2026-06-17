import { NextResponse } from "next/server";

import { monthInputToDate } from "@/lib/profile/profile-dates";
import { requireOwnCandidate } from "@/lib/profile/require-own-candidate";
import {
  validateExperiencePayload,
  type ExperienceEntryPayload,
} from "@/lib/profile/validation";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: Request) {
  let body: { entries?: ExperienceEntryPayload[] };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const entries = body.entries ?? [];
  const validationError = validateExperiencePayload(entries);

  if (validationError) {
    return NextResponse.json(
      { success: false, error: validationError },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const context = await requireOwnCandidate(supabase);

  if (!context) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  const { data: existingRows } = await supabase
    .from("employment_history")
    .select("id")
    .eq("candidate_id", context.candidateId);

  const incomingIds = new Set(
    entries.map((entry) => entry.id).filter(Boolean) as string[],
  );

  const idsToDelete =
    existingRows
      ?.map((row) => row.id)
      .filter((id) => !incomingIds.has(id)) ?? [];

  if (idsToDelete.length > 0) {
    const { error } = await supabase
      .from("employment_history")
      .delete()
      .in("id", idsToDelete);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }
  }

  for (const [index, entry] of entries.entries()) {
    const payload = {
      candidate_id: context.candidateId,
      job_title: entry.title!.trim(),
      company_name: entry.company!.trim(),
      location: entry.location?.trim() || null,
      start_date: monthInputToDate(entry.startDate ?? "")!,
      end_date: entry.isCurrent
        ? null
        : monthInputToDate(entry.endDate ?? ""),
      is_current: Boolean(entry.isCurrent),
      description: entry.description?.trim() || null,
      sort_order: index,
    };

    if (entry.id) {
      const { error } = await supabase
        .from("employment_history")
        .update(payload)
        .eq("id", entry.id)
        .eq("candidate_id", context.candidateId);

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 },
        );
      }
    } else {
      const { error } = await supabase.from("employment_history").insert(payload);

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json({ success: true });
}
