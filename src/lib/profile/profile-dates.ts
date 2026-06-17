export function monthInputToDate(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return `${trimmed}-01`;
}

export function parseOptionalYears(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);

  if (Number.isNaN(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}
