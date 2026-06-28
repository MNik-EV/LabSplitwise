"use client";

import { SettlementCard } from "@/components/settlement/settlement-card";
import { WeeklySummary } from "@/components/settlement/weekly-summary";
import { Card, CardContent } from "@/components/ui/card";
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

interface SettlementViewProps {
  transfers: TransferItem[];
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
  totalExpenses,
  labContribution,
  totalOrders,
  paidCount,
  totalTransferCount,
  isClosed,
  readOnly,
}: SettlementViewProps) {
  const { t } = useI18n();
  const allPaid = totalTransferCount > 0 && paidCount === totalTransferCount;

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

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">
          {t("settlement.optimalTransfers")}{" "}
          <span className="text-sm font-normal text-muted-foreground">
            {t("settlement.minTransactions")}
          </span>
        </h2>

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
