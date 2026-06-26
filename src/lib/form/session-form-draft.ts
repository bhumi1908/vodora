export const SESSION_FORM_DRAFT_VERSION = 1;
export const SESSION_FORM_DRAFT_MAX_AGE_MS = 60 * 60 * 1000;

type SessionFormDraftEnvelope<T> = {
  version: number;
  savedAt: string;
  data: T;
};

export function buildSessionFormDraftKey(...parts: string[]): string {
  return `vodora:draft:${parts.join(":")}`;
}

function isSessionStorageAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function readSessionFormDraft<T>(storageKey: string): T | null {
  if (!isSessionStorageAvailable()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(storageKey);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as SessionFormDraftEnvelope<T>;

    if (parsed.version !== SESSION_FORM_DRAFT_VERSION || !parsed.savedAt) {
      window.sessionStorage.removeItem(storageKey);
      return null;
    }

    const savedAt = Date.parse(parsed.savedAt);

    if (Number.isNaN(savedAt)) {
      window.sessionStorage.removeItem(storageKey);
      return null;
    }

    if (Date.now() - savedAt > SESSION_FORM_DRAFT_MAX_AGE_MS) {
      window.sessionStorage.removeItem(storageKey);
      return null;
    }

    return parsed.data;
  } catch {
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      // Ignore storage errors.
    }

    return null;
  }
}

export function writeSessionFormDraft<T>(storageKey: string, data: T): void {
  if (!isSessionStorageAvailable()) {
    return;
  }

  try {
    const envelope: SessionFormDraftEnvelope<T> = {
      version: SESSION_FORM_DRAFT_VERSION,
      savedAt: new Date().toISOString(),
      data,
    };

    window.sessionStorage.setItem(storageKey, JSON.stringify(envelope));
  } catch {
    // Ignore quota and privacy-mode storage errors.
  }
}

export function clearSessionFormDraft(storageKey: string): void {
  if (!isSessionStorageAvailable()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(storageKey);
  } catch {
    // Ignore storage errors.
  }
}

export function isRecordEqualToEmpty<T extends Record<string, unknown>>(
  data: T,
  empty: T,
): boolean {
  return (Object.keys(empty) as (keyof T)[]).every((key) => data[key] === empty[key]);
}
