import { NextResponse } from "next/server";

import { parseOptionalYears } from "@/lib/profile/profile-dates";
import { requireOwnCandidate } from "@/lib/profile/require-own-candidate";
import { validateSkillsEntries } from "@/lib/profile/validation";
import { createClient } from "@/lib/supabase/server";

type SkillEntryPayload = {
  id?: string | null;
  name?: string;
  proficiency?: string;
  yearsExperience?: string;
};

const VALID_PROFICIENCY = new Set([
  "",
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);

export async function PUT(request: Request) {
  let body: { entries?: SkillEntryPayload[] };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const entries =
    body.entries?.map((entry) => ({
      id: entry.id ?? null,
      name: entry.name ?? "",
      proficiency: entry.proficiency ?? "",
      yearsExperience: entry.yearsExperience ?? "",
    })) ?? [];

  const validationError = validateSkillsEntries(entries);

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

  for (const entry of entries) {
    const proficiency = entry.proficiency?.trim() ?? "";

    if (!VALID_PROFICIENCY.has(proficiency)) {
      return NextResponse.json(
        { success: false, error: "Invalid skill proficiency value." },
        { status: 400 },
      );
    }
  }

  const { data: existingRows } = await supabase
    .from("candidate_skills")
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
      .from("candidate_skills")
      .delete()
      .in("id", idsToDelete);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }
  }

  for (const entry of entries) {
    const payload = {
      candidate_id: context.candidateId,
      skill_name: entry.name.trim(),
      proficiency: entry.proficiency?.trim() || null,
      years_experience: parseOptionalYears(entry.yearsExperience ?? ""),
    };

    if (entry.id) {
      const { error } = await supabase
        .from("candidate_skills")
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
      const { error } = await supabase.from("candidate_skills").insert(payload);

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
