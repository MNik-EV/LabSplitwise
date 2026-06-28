import { PageTransition, PageHeader } from "@/components/shared/page-transition";
import { SettlementView } from "@/components/settlement/settlement-view";
import { SettlementActions } from "@/components/settlement/settlement-actions";
import { ClosePendingWeekButton } from "@/components/settlement/close-pending-week-button";
import { Card, CardContent } from "@/components/ui/card";
import { getWeeklySettlement, getSettings, getPendingPreviousWeek } from "@/actions";
import { getServerI18n } from "@/i18n/server";
import { formatLocalizedDate } from "@/lib/format";

export default async function SettlementPage() {
  const { t, locale } = await getServerI18n();
  const settings = await getSettings();
  const [settlement, pendingWeek] = await Promise.all([
    getWeeklySettlement(settings.weekStartDay),
    getPendingPreviousWeek(settings.weekStartDay),
  ]);

  return (
    <PageTransition>
      <PageHeader
        title={t("settlement.title")}
        description={t("settlement.weekRange", {
          start: formatLocalizedDate(settlement.weekStart, locale),
          end: formatLocalizedDate(settlement.weekEnd, locale),
        })}
        action={
          !settlement.isClosed ? (
            <SettlementActions
              weekStartDay={settings.weekStartDay}
              isClosed={settlement.isClosed}
              totalOrders={settlement.totalOrders}
              paidCount={settlement.paidCount}
              totalTransferCount={settlement.totalTransferCount}
            />
          ) : undefined
        }
      />

      {pendingWeek && (
        <Card className="mb-6 border-warning/40 bg-warning/5">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">{t("settlement.pendingWeekBanner")}</p>
            <ClosePendingWeekButton
              weekKey={pendingWeek.weekKey}
              weekStartDay={settings.weekStartDay}
              unpaidCount={pendingWeek.totalTransfers - pendingWeek.paidTransfers}
            />
          </CardContent>
        </Card>
      )}

      <SettlementView
        transfers={settlement.transfers}
        balances={settlement.balances}
        totalExpenses={settlement.totalExpenses}
        labContribution={settlement.labContribution}
        totalOrders={settlement.totalOrders}
        paidCount={settlement.paidCount}
        totalTransferCount={settlement.totalTransferCount}
        isClosed={settlement.isClosed}
        weekLabel={t("settlement.weekRange", {
          start: formatLocalizedDate(settlement.weekStart, locale),
          end: formatLocalizedDate(settlement.weekEnd, locale),
        })}
      />
    </PageTransition>
  );
}
