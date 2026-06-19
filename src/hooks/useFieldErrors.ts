"use client";

import { useCallback, useState } from "react";

import type { FieldErrors } from "@/lib/form/field-errors";

export function useFieldErrors<T extends string>() {
  const [errors, setErrorsState] = useState<FieldErrors<T>>({});

  const setErrors = useCallback((newErrors: FieldErrors<T>) => {
    setErrorsState(newErrors);
  }, []);

  const clearField = useCallback((field: T) => {
    setErrorsState((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const next = { ...previous };
      delete next[field];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setErrorsState({});
  }, []);

  const getError = useCallback(
    (field: T) => errors[field],
    [errors],
  );

  return { errors, setErrors, clearField, clearAll, getError };
}
