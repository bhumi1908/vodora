type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const stores = new Map<string, Map<string, RateLimitEntry>>();

export type RateLimitConfig = {
  name: string;
  limit: number;
  windowMs: number;
};

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

function getStore(name: string): Map<string, RateLimitEntry> {
  let store = stores.get(name);

  if (!store) {
    store = new Map();
    stores.set(name, store);
  }

  return store;
}

export function checkRateLimit(
  config: RateLimitConfig,
  key: string,
): RateLimitResult {
  const store = getStore(config.name);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.limit - 1 };
  }

  if (entry.count >= config.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return { allowed: true, remaining: config.limit - entry.count };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export const AUTH_LOGIN_RATE_LIMIT: RateLimitConfig = {
  name: "auth-login",
  limit: 10,
  windowMs: 15 * 60 * 1000,
};

export const AUTH_RESEND_IP_RATE_LIMIT: RateLimitConfig = {
  name: "auth-resend-ip",
  limit: 5,
  windowMs: 60 * 60 * 1000,
};

export const AUTH_RESEND_EMAIL_RATE_LIMIT: RateLimitConfig = {
  name: "auth-resend-email",
  limit: 3,
  windowMs: 60 * 60 * 1000,
};

export function createRateLimitResponse(retryAfterSeconds: number): Response {
  return Response.json(
    {
      success: false,
      error: "Too many requests. Please try again later.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}
