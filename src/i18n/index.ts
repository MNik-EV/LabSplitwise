import type { Locale } from "@/config/defaults";
import { localeConfig } from "@/config/defaults";
import { dictionary as faDict } from "./dictionaries/fa";
import { dictionary as enDict } from "./dictionaries/en";

export type Dictionary = typeof faDict;

export function getDictionary(locale: Locale): Dictionary {
  return (locale === "en" ? enDict : faDict) as Dictionary;
}

export function t(
  dict: Dictionary,
  key: string,
  params?: Record<string, string | number>,
): string {
  const keys = key.split(".");
  let value: unknown = dict;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
  }
  if (typeof value !== "string") return key;
  if (!params) return value;
  return Object.entries(params).reduce(
    (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
    value,
  );
}

export function formatMoney(amount: number, locale: Locale): string {
  const { numberLocale, currency } = localeConfig[locale];
  return `${amount.toLocaleString(numberLocale)} ${currency}`;
}

export function formatCount(num: number, locale: Locale): string {
  return num.toLocaleString(locale === "en" ? "en-US" : "fa-IR");
}
