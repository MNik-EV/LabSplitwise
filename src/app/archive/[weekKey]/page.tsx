import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { PageTransition, PageHeader } from "@/components/shared/page-transition";
import { SettlementView } from "@/components/settlement/settlement-view";
import { SettlementActions } from "@/components/settlement/settlement-actions";
import { OrderCard } from "@/components/orders/order-card";
import { getSettlementByWeekKey, getOrders, getSettings } from "@/actions";
import { getServerI18n } from "@/i18n/server";
import { localeConfig } from "@/config/defaults";
import { formatLocalizedDate } from "@/lib/format";
import { getWeekRangeFromKey } from "@/lib/week";

interface ArchiveWeekPageProps {
  params: Promise<{ weekKey: string }>;
}

export default async function ArchiveWeekPage({ params }: ArchiveWeekPageProps) {
  const { weekKey } = await params;
  const { t, locale } = await getServerI18n();
  const { dir } = localeConfig[locale];
  const settings = await getSettings();
  const { start, end } = getWeekRangeFromKey(weekKey, settings.weekStartDay);

  const [settlement, orders] = await Promise.all([
    getSettlementByWeekKey(weekKey, settings.weekStartDay),
    getOrders({ weekStart: start, weekEnd: end, currentWeekOnly: false }),
  ]);

  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <PageTransition>
      <PageHeader
        title={t("archive.weekTitle")}
        description={t("settlement.weekRange", {
          start: formatLocalizedDate(settlement.weekStart, locale),
          end: formatLocalizedDate(settlement.weekEnd, locale),
        })}
        action={
          !settlement.isClosed ? (
            <SettlementActions
              weekStartDay={settings.weekStartDay}
              weekKey={weekKey}
              totalOrders={settlement.totalOrders}
              paidCount={settlement.paidCount}
              totalTransferCount={settlement.totalTransferCount}
            />
          ) : undefined
        }
      />

      <Link
        href="/archive"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <BackArrow className="h-4 w-4" />
        {t("archive.backToList")}
      </Link>

      <SettlementView
        transfers={settlement.transfers}
        balances={settlement.balances}
        totalExpenses={settlement.totalExpenses}
        labContribution={settlement.labContribution}
        totalOrders={settlement.totalOrders}
        paidCount={settlement.paidCount}
        totalTransferCount={settlement.totalTransferCount}
        isClosed={settlement.isClosed}
        readOnly={settlement.isClosed}
      />

      {orders.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">{t("archive.weekOrders")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} readOnly={settlement.isClosed} />
            ))}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
