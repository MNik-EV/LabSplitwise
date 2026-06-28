import { isValid } from "date-fns";

/** YYYY-MM-DD (local) ↔ Date for forms & DB — always local noon to avoid timezone shifts */
export function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0, 0);
  return isValid(date) ? date : null;
}

export function toDateInputValue(date: Date | null): string {
  if (!date || !isValid(date)) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Local calendar date key for charts and grouping */
export function localDateKey(date: Date): string {
  return toDateInputValue(date);
}

/** Parse Date from DB or ISO string using local calendar day */
export function parseStoredDate(value: Date | string | null | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return parseDateInput(trimmed);
    }
    const d = new Date(trimmed);
    if (!isValid(d)) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
  }
  return null;
}
