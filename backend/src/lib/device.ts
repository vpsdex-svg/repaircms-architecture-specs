/** Luhn (mod 10) checksum — used to validate 15-digit IMEI numbers. */
export function luhnCheck(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 2) return false;

  let sum = 0;
  let double = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }

  return sum % 10 === 0;
}

/** IMEI must be exactly 15 digits and pass the Luhn checksum. */
export function isValidImei(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 15 && luhnCheck(digits);
}

/**
 * Pattern-lock serialisation: the 3x3 grid is indexed 1..9 (row-major) and the
 * touched sequence is stored as an ordered array, e.g. [1, 2, 5, 8, 9].
 */
export function isValidPattern(sequence: number[]): boolean {
  if (!Array.isArray(sequence) || sequence.length < 4) return false;
  const seen = new Set<number>();
  for (const point of sequence) {
    if (!Number.isInteger(point) || point < 1 || point > 9) return false;
    if (seen.has(point)) return false;
    seen.add(point);
  }
  return true;
}
