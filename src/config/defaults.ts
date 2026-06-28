/**
 * Central app defaults — change values here or via .env
 *
 * NEXT_PUBLIC_DEFAULT_LOCALE=fa|en
 * NEXT_PUBLIC_DEFAULT_LAB_PER_PERSON=350
 */
export const appDefaults = {
  locale: (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fa") as "fa" | "en",
  labPerPerson: Number(process.env.NEXT_PUBLIC_DEFAULT_LAB_PER_PERSON ?? "350"),
  labName: {
    fa: "آزمایشگاه ZLab",
    en: "ZLab Laboratory",
  },
  weekStartDay: 6,
} as const;

export type Locale = "fa" | "en";

export const localeConfig: Record<
  Locale,
  { dir: "rtl" | "ltr"; label: string; currency: string; numberLocale: string }
> = {
  fa: {
    dir: "rtl",
    label: "فارسی",
    currency: "تومان",
    numberLocale: "fa-IR",
  },
  en: {
    dir: "ltr",
    label: "English",
    currency: "USD",
    numberLocale: "en-US",
  },
};
