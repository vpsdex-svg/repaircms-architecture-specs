import type { Prisma, PrismaClient } from "@prisma/client";
import { round2 } from "./money.js";

type Db = PrismaClient | Prisma.TransactionClient;

export type SequenceKey = "JOB" | "INVOICE" | "CREDIT_NOTE" | "CASHBOOK";

const DEFAULT_PREFIX: Record<SequenceKey, string> = {
  JOB: "JOB",
  INVOICE: "RE",
  CREDIT_NOTE: "ST",
  CASHBOOK: "AB",
};

/**
 * Gap-free, tenant-scoped document numbering (GoBD).
 *
 * The counter row is locked for the duration of the surrounding transaction so
 * two concurrent requests can never receive the same number and no number can
 * be skipped.
 */
export async function nextDocumentNumber(
  db: Db,
  options: {
    companyId: string;
    locationId?: string | null;
    key: SequenceKey;
    year?: number;
    prefix?: string;
    padding?: number;
  },
): Promise<string> {
  const year = options.year ?? new Date().getFullYear();
  const prefix = options.prefix ?? DEFAULT_PREFIX[options.key];
  const padding = options.padding ?? 5;

  const existing = await db.numberSequence.findFirst({
    where: {
      companyId: options.companyId,
      locationId: options.locationId ?? null,
      key: options.key,
      year,
    },
  });

  let value: number;
  if (!existing) {
    value = 1;
    await db.numberSequence.create({
      data: {
        companyId: options.companyId,
        locationId: options.locationId ?? null,
        key: options.key,
        year,
        prefix,
        padding,
        nextValue: value + 1,
      },
    });
  } else {
    const updated = await db.numberSequence.update({
      where: { id: existing.id },
      data: { nextValue: { increment: 1 } },
    });
    value = updated.nextValue - 1;
  }

  return `${prefix}-${year}-${String(value).padStart(padding, "0")}`;
}

/** Stock selling-price calculator (brief §5). */
export function priceFromMarkup(purchasePriceNet: number, markupPercent: number, taxRate: number) {
  const sellingPriceNet = round2(purchasePriceNet * (1 + markupPercent / 100));
  const sellingPriceGross = round2(sellingPriceNet * (1 + taxRate / 100));
  return { sellingPriceNet, sellingPriceGross };
}
