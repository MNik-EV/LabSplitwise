import { parseStoredDate } from "@/lib/date-input";
import { format as formatJalali } from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale";
import { format as formatGregorian } from "date-fns";
import { enUS } from "date-fns/locale";
import type { Locale } from "@/config/defaults";

export function formatLocalizedDate(
  date: Date | string,
  locale: Locale,
): string {
  const d = parseStoredDate(date);
  if (!d) return "—";

  try {
    if (locale === "en") {
      return formatGregorian(d, "MMM d, yyyy", { locale: enUS });
    }
    return formatJalali(d, "d MMMM yyyy", { locale: faIR });
  } catch {
    return formatGregorian(d, "MMM d, yyyy", { locale: enUS });
  }
}

export function formatLocalizedShort(
  date: Date | string,
  locale: Locale,
): string {
  const d = parseStoredDate(date);
  if (!d) return "—";

  try {
    if (locale === "en") {
      return formatGregorian(d, "MMM d", { locale: enUS });
    }
    return formatJalali(d, "d MMM", { locale: faIR });
  } catch {
    return formatGregorian(d, "MMM d", { locale: enUS });
  }
}

/** @deprecated use formatLocalizedDate */
export function formatJalaliDate(date: Date | string): string {
  return formatLocalizedDate(date, "fa");
}

/** @deprecated use formatLocalizedShort */
export function formatJalaliShort(date: Date | string): string {
  return formatLocalizedShort(date, "fa");
}
