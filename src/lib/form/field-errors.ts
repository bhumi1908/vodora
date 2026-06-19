export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

export function firstFieldError<T extends string>(
  errors: FieldErrors<T>,
): string | null {
  for (const message of Object.values(errors)) {
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return null;
}

export function hasFieldErrors<T extends string>(errors: FieldErrors<T>): boolean {
  return Object.values(errors).some(
    (message) => typeof message === "string" && message.length > 0,
  );
}

export function entryFieldKey(
  index: number,
  field: string,
): `${number}.${string}` {
  return `${index}.${field}`;
}
