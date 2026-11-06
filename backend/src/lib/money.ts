import { Prisma } from "@prisma/client";

export const VAT_STANDARD = 19;
export const VAT_REDUCED = 7;
export const VAT_EXEMPT = 0;

const dec = (value: number) => new Prisma.Decimal(value.toFixed(2));

/** Half-up to cents — the only rounding allowed inside fiscal calculations. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export type LineInput = {
  quantity: number;
  unitPriceNet: number;
  taxRate: number;
  discountPercent?: number;
};

export type LineTotals = {
  totalNet: number;
  taxAmount: number;
  totalGross: number;
};

export function calculateLine(line: LineInput): LineTotals {
  const quantity = Number(line.quantity) || 0;
  const grossNet = quantity * (Number(line.unitPriceNet) || 0);
  const discount = Number(line.discountPercent) || 0;
  const totalNet = round2(grossNet * (1 - discount / 100));
  const taxAmount = round2((totalNet * (Number(line.taxRate) || 0)) / 100);
  return { totalNet, taxAmount, totalGross: round2(totalNet + taxAmount) };
}

export type DocumentTotals = {
  subtotalNet: number;
  taxTotal: number;
  totalGross: number;
  taxBreakdown: Array<{ taxRate: number; net: number; tax: number; gross: number }>;
};

export function calculateDocument(lines: LineInput[]): DocumentTotals {
  const buckets = new Map<number, { net: number; tax: number }>();
  let subtotalNet = 0;
  let taxTotal = 0;

  for (const line of lines) {
    const totals = calculateLine(line);
    subtotalNet = round2(subtotalNet + totals.totalNet);
    taxTotal = round2(taxTotal + totals.taxAmount);
    const bucket = buckets.get(line.taxRate) ?? { net: 0, tax: 0 };
    bucket.net = round2(bucket.net + totals.totalNet);
    bucket.tax = round2(bucket.tax + totals.taxAmount);
    buckets.set(line.taxRate, bucket);
  }

  return {
    subtotalNet,
    taxTotal,
    totalGross: round2(subtotalNet + taxTotal),
    taxBreakdown: [...buckets.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([taxRate, value]) => ({
        taxRate,
        net: value.net,
        tax: value.tax,
        gross: round2(value.net + value.tax),
      })),
  };
}

export function toDecimal(value: number): Prisma.Decimal {
  return dec(value);
}

/** Prisma Decimal / null -> plain number for JSON responses. */
export function num(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}
