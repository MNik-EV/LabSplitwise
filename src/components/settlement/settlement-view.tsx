"use client";

import { WeeklySummary } from "@/components/settlement/weekly-summary";
import { SettlementCard } from "@/components/settlement/settlement-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/layout/i18n-provider";

interface TransferItem {
  fromUserId: string;
  toUserId: string;
  amount: number;
  settlementId?: string;
  isPaid: boolean;
  fromUser: { id: string; name: string; cardNumber?: string | null };
  toUser: { id: string; name: string; cardNumber?: string | null };
}

interface BalanceItem {
  user: { id: string; name: string };
  amount: number;
}

interface SettlementViewProps {
  transfers: TransferItem[];
  balances?: BalanceItem[];
  totalExpenses: number;
  labContribution: number;
  totalOrders: number;
  paidCount: number;
  totalTransferCount: number;
  isClosed?: boolean;
  readOnly?: boolean;
}

export function SettlementView({
  transfers,
  balances = [],
  totalExpenses,
  labContribution,
  totalOrders,
  paidCount,
  totalTransferCount,
  isClosed,
  readOnly,
}: SettlementViewProps) {
  const { t, formatMoney } = useI18n();
  const allPaid = totalTransferCount > 0 && paidCount === totalTransferCount;
  const unpaidCount = totalTransferCount - paidCount;

  return (
    <>
      <WeeklySummary
        totalExpenses={totalExpenses}
        labContribution={labContribution}
        totalOrders={totalOrders}
        transferCount={transfers.length}
      />

      {totalTransferCount > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Badge variant={allPaid ? "success" : "secondary"}>
            {t("settlement.paymentProgress", {
              paid: paidCount,
              total: totalTransferCount,
            })}
          </Badge>
          {isClosed && <Badge variant="outline">{t("settlement.closedBadge")}</Badge>}
          {!isClosed && !readOnly && (
            <Badge variant="default">{t("settlement.currentWeekBadge")}</Badge>
          )}
        </div>
      )}

      {!isClosed && !readOnly && unpaidCount > 0 && (
        <Card className="mt-4 border-warning/40 bg-warning/5">
          <CardContent className="p-4 text-sm">
            {t("settlement.unpaidWarning", { count: unpaidCount })}
          </CardContent>
        </Card>
      )}

      {balances.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">{t("settlement.balancesTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {balances.map((b) => (
                <div
                  key={b.user.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{b.user.name}</span>
                  <Badge variant={b.amount >= 0 ? "success" : "destructive"}>
                    {b.amount >= 0 ? "+" : "−"}
                    {formatMoney(Math.abs(b.amount))}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">{t("settlement.transfers")}</h2>

        {transfers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {t("settlement.allSettled")}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {transfers.map((transfer, i) => (
              <SettlementCard
                key={transfer.settlementId ?? `${transfer.fromUserId}-${transfer.toUserId}`}
                settlementId={transfer.settlementId}
                fromUser={transfer.fromUser}
                toUser={transfer.toUser}
                amount={transfer.amount}
                isPaid={transfer.isPaid}
                readOnly={readOnly || isClosed}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
