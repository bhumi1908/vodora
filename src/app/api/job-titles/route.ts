import { NextResponse } from "next/server";

import { getCachedJobTitleOptionGroups } from "@/lib/job-titles/fetch-job-titles";

export async function GET() {
  try {
    const optionGroups = await getCachedJobTitleOptionGroups();

    return NextResponse.json({
      success: true,
      optionGroups,
    });
  } catch (error) {
    console.error("Failed to load job titles:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load job titles." },
      { status: 500 },
    );
  }
}
