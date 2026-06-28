import { cookies } from "next/headers";
import { appDefaults, type Locale } from "@/config/defaults";
import { getDictionary, t, formatMoney, formatCount } from "@/i18n/index";
import { prisma } from "@/lib/prisma";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;

  if (cookieLocale === "fa" || cookieLocale === "en") {
    return cookieLocale;
  }

  try {
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    if (settings?.defaultLocale === "fa" || settings?.defaultLocale === "en") {
      return settings.defaultLocale as Locale;
    }
  } catch {
    /* db not ready */
  }

  return appDefaults.locale;
}

export async function getServerI18n() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    locale,
    dict,
    t: (key: string, params?: Record<string, string | number>) =>
      t(dict, key, params),
    formatMoney: (amount: number) => formatMoney(amount, locale),
    formatCount: (num: number) => formatCount(num, locale),
  };
}
