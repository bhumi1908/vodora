import { NextResponse } from "next/server";

import { requireOwnCandidate } from "@/lib/profile/require-own-candidate";
import {
  parseSpotlightBlocks,
  validateSpotlightBlocks,
} from "@/lib/profile/spotlight";
import type { SpotlightBlock } from "@/lib/profile/spotlight.types";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: Request) {
  let body: { blocks?: SpotlightBlock[] };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const blocks = parseSpotlightBlocks(body.blocks ?? []);
  const validationError = validateSpotlightBlocks(blocks);

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

  const { error } = await supabase
    .from("candidates")
    .update({ spotlight_blocks: blocks })
    .eq("id", context.candidateId);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
