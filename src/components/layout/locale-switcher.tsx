"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/layout/i18n-provider";
import type { Locale } from "@/config/defaults";

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const next: Locale = locale === "fa" ? "en" : "fa";

  return (
    <Button
      variant="outline"
      className={compact ? "h-9 gap-2 px-3" : "w-full justify-start gap-2"}
      onClick={() => setLocale(next)}
      title={t("locale.switch")}
    >
      <Languages className="h-4 w-4" />
      <span>{locale === "fa" ? "EN" : "فا"}</span>
      {!compact && (
        <span className="text-muted-foreground">
          {locale === "fa" ? t("locale.en") : t("locale.fa")}
        </span>
      )}
    </Button>
  );
}
