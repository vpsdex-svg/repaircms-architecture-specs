import { Prisma } from "@prisma/client";

/**
 * Converts Prisma Decimal / Date values into JSON-friendly primitives.
 *
 * Prisma's Decimal does not survive `res.json()` as a string in every driver
 * build, so it is normalised explicitly here (a raw Decimal would otherwise
 * serialise as `{ s, e, d }` and break the UI).
 */
export function toPlain<T>(value: T): T {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) return value.map((item) => toPlain(item)) as unknown as T;

  if (typeof value === "object") {
    if (Prisma.Decimal.isDecimal(value)) {
      return Number(value.toString()) as unknown as T;
    }
    if (value instanceof Date) return value;

    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      result[key] = toPlain(item);
    }
    return result as T;
  }

  return value;
}
