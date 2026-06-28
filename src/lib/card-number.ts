/** Strip non-digits from card input */
export function normalizeCardNumber(value: string): string {
  return value.replace(/\D/g, "");
}

/** Display as groups of 4 digits */
export function formatCardNumber(value: string | null | undefined): string {
  const digits = normalizeCardNumber(value ?? "");
  if (!digits) return "";
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function isValidCardNumber(value: string): boolean {
  const digits = normalizeCardNumber(value);
  return digits.length === 0 || digits.length === 16;
}
