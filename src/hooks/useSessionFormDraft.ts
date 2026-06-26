"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  clearSessionFormDraft,
  readSessionFormDraft,
  writeSessionFormDraft,
} from "@/lib/form/session-form-draft";

type UseSessionFormDraftOptions<T> = {
  storageKey: string;
  data: T;
  enabled?: boolean;
  debounceMs?: number;
  isEmpty?: (data: T) => boolean;
};

export function useSessionFormDraft<T>({
  storageKey,
  data,
  enabled = true,
  debounceMs = 400,
  isEmpty,
}: UseSessionFormDraftOptions<T>) {
  const canSaveRef = useRef(false);
  const skipNextSaveRef = useRef(false);

  const restoreDraft = useCallback((): T | null => {
    return readSessionFormDraft<T>(storageKey);
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    skipNextSaveRef.current = true;
    clearSessionFormDraft(storageKey);
  }, [storageKey]);

  const markHydrated = useCallback(() => {
    canSaveRef.current = true;
  }, []);

  useEffect(() => {
    if (!enabled || !canSaveRef.current) {
      return;
    }

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      if (isEmpty?.(data)) {
        clearSessionFormDraft(storageKey);
        return;
      }

      writeSessionFormDraft(storageKey, data);
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [data, debounceMs, enabled, isEmpty, storageKey]);

  return {
    restoreDraft,
    clearDraft,
    markHydrated,
  };
}
