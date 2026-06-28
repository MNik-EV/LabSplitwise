import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "تومان"): string {
  return `${amount.toLocaleString("fa-IR")} ${currency}`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString("fa-IR");
}

export function toPersianDigits(str: string | number): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(str).replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
}

export function getWeekRange(date: Date = new Date(), weekStartDay = 6): {
  start: Date;
  end: Date;
} {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const day = d.getDay();
  const diff = (day - weekStartDay + 7) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - diff);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function getPreviousWeekRange(weekStartDay = 6): { start: Date; end: Date } {
  const { start } = getWeekRange(new Date(), weekStartDay);
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - 7);
  const prevEnd = new Date(prevStart);
  prevEnd.setDate(prevStart.getDate() + 6);
  prevEnd.setHours(23, 59, 59, 999);
  return { start: prevStart, end: prevEnd };
}
