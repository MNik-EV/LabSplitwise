import { getWeekRange } from "@/lib/utils";

/** Stable URL key for a week (local week-start date) */
export function weekKeyFromDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseWeekKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function getWeekRangeFromKey(key: string, weekStartDay = 6) {
  return getWeekRange(parseWeekKey(key), weekStartDay);
}

export function isSameWeek(a: Date, b: Date, weekStartDay = 6): boolean {
  const wa = getWeekRange(a, weekStartDay);
  const wb = getWeekRange(b, weekStartDay);
  return wa.start.getTime() === wb.start.getTime();
}

export function isWeekBefore(weekStart: Date, reference = new Date(), weekStartDay = 6): boolean {
  const current = getWeekRange(reference, weekStartDay);
  return weekStart.getTime() < current.start.getTime();
}
