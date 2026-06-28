import { format as formatJalali } from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale";
import { format as formatGregorian } from "date-fns";
import { enUS } from "date-fns/locale";
import type { Locale } from "@/config/defaults";

export function formatLocalizedDate(
  date: Date | string,
  locale: Locale,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (locale === "en") {
    return formatGregorian(d, "MMM d, yyyy", { locale: enUS });
  }
  return formatJalali(d, "d MMMM yyyy", { locale: faIR });
}

export function formatLocalizedShort(
  date: Date | string,
  locale: Locale,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (locale === "en") {
    return formatGregorian(d, "MMM d", { locale: enUS });
  }
  return formatJalali(d, "d MMM", { locale: faIR });
}

/** @deprecated use formatLocalizedDate */
export function formatJalaliDate(date: Date | string): string {
  return formatLocalizedDate(date, "fa");
}

/** @deprecated use formatLocalizedShort */
export function formatJalaliShort(date: Date | string): string {
  return formatLocalizedShort(date, "fa");
}

export function getInitials(name: string): string {
  return name.charAt(0);
}

export const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-indigo-500",
];

export function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
