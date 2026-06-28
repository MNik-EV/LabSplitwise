import { PageTransition, PageHeader } from "@/components/shared/page-transition";
import { SettlementCard } from "@/components/settlement/settlement-card";
import { WeeklySummary } from "@/components/settlement/weekly-summary";
import { SettlementActions } from "@/components/settlement/settlement-actions";
import { Card, CardContent } from "@/components/ui/card";
import { getWeeklySettlement, getSettings } from "@/actions";
import { getServerI18n } from "@/i18n/server";
import { formatLocalizedDate } from "@/lib/format";

export default async function SettlementPage() {
  const { t, locale } = await getServerI18n();
  const settings = await getSettings();
  const settlement = await getWeeklySettlement(settings.weekStartDay);

  return (
    <PageTransition>
      <PageHeader
        title={t("settlement.title")}
        description={t("settlement.weekRange", {
          start: formatLocalizedDate(settlement.weekStart, locale),
          end: formatLocalizedDate(settlement.weekEnd, locale),
        })}
        action={<SettlementActions weekStartDay={settings.weekStartDay} />}
      />

      <WeeklySummary
        totalExpenses={settlement.totalExpenses}
        labContribution={settlement.labContribution}
        totalOrders={settlement.totalOrders}
        transferCount={settlement.transfers.length}
      />

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">
          {t("settlement.optimalTransfers")}{" "}
          <span className="text-sm font-normal text-muted-foreground">
            {t("settlement.minTransactions")}
          </span>
        </h2>

        {settlement.transfers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {t("settlement.allSettled")}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {settlement.transfers.map((transfer, i) => {
              const existing = settlement.existingSettlements.find(
                (s) =>
                  s.fromUserId === transfer.fromUserId &&
                  s.toUserId === transfer.toUserId,
              );
              return (
                <SettlementCard
                  key={`${transfer.fromUserId}-${transfer.toUserId}`}
                  fromUser={transfer.fromUser}
                  toUser={transfer.toUser}
                  amount={transfer.amount}
                  isPaid={existing?.isPaid}
                  index={i}
                />
              );
            })}
          </div>
        )}
      </div>

      {settlement.existingSettlements.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">{t("settlement.savedSettlements")}</h2>
          <div className="space-y-2">
            {settlement.existingSettlements.map((s, i) => (
              <SettlementCard
                key={s.id}
                fromUser={s.fromUser}
                toUser={s.toUser}
                amount={s.amount}
                isPaid={s.isPaid}
                index={i}
              />
            ))}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
