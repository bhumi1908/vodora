import { NextResponse } from "next/server";

import { monthInputToDate } from "@/lib/profile/profile-dates";
import { requireOwnCandidate } from "@/lib/profile/require-own-candidate";
import {
  validateEducationPayload,
  type EducationEntryPayload,
} from "@/lib/profile/validation";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: Request) {
  let body: { entries?: EducationEntryPayload[] };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const entries = body.entries ?? [];
  const validationError = validateEducationPayload(entries);

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
    .from("candidate_education")
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
      .from("candidate_education")
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
      degree_or_class: entry.degree!.trim(),
      institution_name: entry.school!.trim(),
      start_date: monthInputToDate(entry.startDate ?? ""),
      end_date: monthInputToDate(entry.endDate ?? ""),
      description: entry.description?.trim() || null,
      sort_order: index,
    };

    if (entry.id) {
      const { error } = await supabase
        .from("candidate_education")
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
      const { error } = await supabase.from("candidate_education").insert(payload);

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
