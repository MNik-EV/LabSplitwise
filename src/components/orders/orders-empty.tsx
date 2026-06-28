"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { useI18n } from "@/components/layout/i18n-provider";

export function OrdersEmpty() {
  const { t } = useI18n();

  return (
    <EmptyState
      title={t("orders.empty")}
      description={t("orders.emptyDesc")}
      actionLabel={t("orders.new")}
      href="/orders/new"
    />
  );
}
