"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/layout/i18n-provider";

export function ErrorFallback() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-lg font-semibold">{t("errors.loadPage")}</p>
      <p className="text-muted-foreground">{t("errors.refreshHint")}</p>
      <Button onClick={() => window.location.reload()}>{t("errors.refresh")}</Button>
    </div>
  );
}
