"use client";

import { createContext, useContext, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/config/defaults";
import { localeConfig } from "@/config/defaults";
import { getDictionary, t, formatMoney, formatCount } from "@/i18n/index";
import type { Dictionary } from "@/i18n/index";

interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
  dir: "rtl" | "ltr";
  t: (key: string, params?: Record<string, string | number>) => string;
  formatMoney: (amount: number) => string;
  formatCount: (num: number) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dict = getDictionary(locale);
  const dir = localeConfig[locale].dir;

  const setLocale = useCallback(
    (newLocale: Locale) => {
      document.cookie = `locale=${newLocale};path=/;max-age=31536000;sameSite=lax`;
      router.refresh();
    },
    [router],
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const value: I18nContextValue = {
    locale,
    dict,
    dir,
    t: (key, params) => t(dict, key, params),
    formatMoney: (amount) => formatMoney(amount, locale),
    formatCount: (num) => formatCount(num, locale),
    setLocale,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
