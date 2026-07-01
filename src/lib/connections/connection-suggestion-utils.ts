import type { ConnectionStatus } from "@/lib/connections/connection.types";

export const CONNECTION_SUGGESTION_TOTAL = 4;
export const CONNECTION_SUGGESTIONS_PER_TYPE = 2;
export const CONNECTION_SUGGESTION_FETCH_BUFFER = 12;

export function pickUnconnected<T>(
  items: T[],
  limit: number,
  getConnectionStatus: (item: T) => ConnectionStatus | null | undefined,
): T[] {
  const picked: T[] = [];

  for (const item of items) {
    const status = getConnectionStatus(item);

    if (status) {
      continue;
    }

    picked.push(item);

    if (picked.length >= limit) {
      break;
    }
  }

  return picked;
}

export function interleaveSuggestions<T>(first: T[], second: T[]): T[] {
  const result: T[] = [];
  const maxLength = Math.max(first.length, second.length);

  for (let index = 0; index < maxLength; index += 1) {
    const firstItem = first[index];
    const secondItem = second[index];

    if (firstItem) {
      result.push(firstItem);
    }

    if (secondItem) {
      result.push(secondItem);
    }
  }

  return result;
}

export function buildMixedSuggestions<T extends { id: string }>(
  primaryPool: T[],
  secondaryPool: T[],
  perType: number,
  maxTotal: number,
  getConnectionStatus: (item: T) => ConnectionStatus | null | undefined,
): T[] {
  const primary = pickUnconnected(primaryPool, perType, getConnectionStatus);
  const secondary = pickUnconnected(secondaryPool, perType, getConnectionStatus);
  let mixed = interleaveSuggestions(primary, secondary);

  if (mixed.length >= maxTotal) {
    return mixed.slice(0, maxTotal);
  }

  const usedIds = new Set(mixed.map((item) => item.id));
  const extras = [...primaryPool, ...secondaryPool].filter(
    (item) => !usedIds.has(item.id) && !getConnectionStatus(item),
  );

  for (const item of extras) {
    if (mixed.length >= maxTotal) {
      break;
    }

    mixed.push(item);
    usedIds.add(item.id);
  }

  return mixed.slice(0, maxTotal);
}
