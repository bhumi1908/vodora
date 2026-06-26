import { NextResponse } from "next/server";

import type { ContactApiResponse } from "@/lib/contact/contact-api.types";
import {
  getContactFieldErrors,
  type ContactFormData,
} from "@/lib/contact/validation";
import { submitContact } from "@/lib/contact/submit-contact";
import { hasFieldErrors } from "@/lib/form/field-errors";
import {
  checkRateLimit,
  CONTACT_IP_RATE_LIMIT,
  createRateLimitResponse,
  getClientIp,
} from "@/lib/rate-limit";

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(CONTACT_IP_RATE_LIMIT, clientIp);

  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit.retryAfterSeconds);
  }

  let body: Partial<ContactFormData>;

  try {
    body = (await request.json()) as Partial<ContactFormData>;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." } satisfies ContactApiResponse,
      { status: 400 },
    );
  }

  const fieldErrors = getContactFieldErrors(body);

  if (hasFieldErrors(fieldErrors)) {
    return NextResponse.json(
      {
        success: false,
        error: "Please fix the highlighted fields.",
        fieldErrors,
      } satisfies ContactApiResponse,
      { status: 400 },
    );
  }

  const result = await submitContact(body, clientIp);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        fieldErrors: result.fieldErrors,
      } satisfies ContactApiResponse,
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true } satisfies ContactApiResponse);
}
