export const REMEMBER_ME_PREFERENCE_COOKIE = "vodora_remember_me";

/** ~6 months */
export const SESSION_MAX_AGE_REMEMBERED_SECONDS = 60 * 60 * 24 * 180;

/** 2 days */
export const SESSION_MAX_AGE_SHORT_SECONDS = 60 * 60 * 24 * 2;

export type SessionCookieOptions = {
  httpOnly?: boolean;
  sameSite?: "lax" | "strict" | "none" | boolean;
  secure?: boolean;
  path?: string;
  maxAge?: number;
  expires?: Date;
  domain?: string;
};

export type CookieToSet = {
  name: string;
  value: string;
  options?: SessionCookieOptions;
};

type CookieGetter = {
  get(name: string): { value: string } | undefined;
};

export function getSessionMaxAgeSeconds(rememberMe: boolean): number {
  return rememberMe
    ? SESSION_MAX_AGE_REMEMBERED_SECONDS
    : SESSION_MAX_AGE_SHORT_SECONDS;
}

export function readRememberMePreference(getter: CookieGetter): boolean {
  const value = getter.get(REMEMBER_ME_PREFERENCE_COOKIE)?.value;
  return value !== "0";
}

function preferenceCookieBaseOptions(): SessionCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export function applySessionCookieMaxAge(
  cookiesToSet: CookieToSet[],
  rememberMe: boolean,
): CookieToSet[] {
  const maxAge = getSessionMaxAgeSeconds(rememberMe);

  return cookiesToSet.map((cookie) => ({
    ...cookie,
    options: {
      ...cookie.options,
      maxAge,
    },
  }));
}

export function buildRememberMePreferenceCookie(rememberMe: boolean): CookieToSet {
  return {
    name: REMEMBER_ME_PREFERENCE_COOKIE,
    value: rememberMe ? "1" : "0",
    options: {
      ...preferenceCookieBaseOptions(),
      maxAge: getSessionMaxAgeSeconds(rememberMe),
    },
  };
}

export function buildClearedRememberMePreferenceCookie(): CookieToSet {
  return {
    name: REMEMBER_ME_PREFERENCE_COOKIE,
    value: "",
    options: {
      ...preferenceCookieBaseOptions(),
      maxAge: 0,
    },
  };
}

export type PersistSessionCookiesOptions = {
  getAll: () => { name: string; value: string }[];
  rememberMeOverride?: boolean;
};

export function resolveRememberMePreference(
  options: PersistSessionCookiesOptions,
): boolean {
  if (options.rememberMeOverride !== undefined) {
    return options.rememberMeOverride;
  }

  const cookies = options.getAll();
  const getter: CookieGetter = {
    get(name) {
      const match = cookies.find((cookie) => cookie.name === name);
      return match ? { value: match.value } : undefined;
    },
  };

  return readRememberMePreference(getter);
}

export function prepareAuthCookiesForPersistence(
  cookiesToSet: CookieToSet[],
  persistOptions: PersistSessionCookiesOptions,
): CookieToSet[] {
  const rememberMe = resolveRememberMePreference(persistOptions);
  const authCookies = applySessionCookieMaxAge(cookiesToSet, rememberMe);

  if (persistOptions.rememberMeOverride !== undefined) {
    return [...authCookies, buildRememberMePreferenceCookie(rememberMe)];
  }

  return authCookies;
}
