"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CopyCardNumber } from "@/components/shared/copy-card-number";
import { PaymentToggle } from "@/components/settlement/payment-toggle";
import { useI18n } from "@/components/layout/i18n-provider";

interface SettlementCardProps {
  settlementId?: string;
  fromUser: { id: string; name: string; cardNumber?: string | null };
  toUser: { id: string; name: string; cardNumber?: string | null };
  amount: number;
  isPaid?: boolean;
  readOnly?: boolean;
  index?: number;
}

export function SettlementCard({
  settlementId,
  fromUser,
  toUser,
  amount,
  isPaid = false,
  readOnly = false,
  index = 0,
}: SettlementCardProps) {
  const { t, formatMoney, dir } = useI18n();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const money = formatMoney(amount);
  const canToggle = Boolean(settlementId) && !readOnly;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={cn(
          "overflow-hidden transition-shadow",
          isPaid ? "border-success/30 bg-success/5" : "border-border",
        )}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-6">
            <p className="min-w-0 flex-1 truncate text-end text-base font-semibold sm:text-lg">
              {fromUser.name}
            </p>

            <div className="flex shrink-0 flex-col items-center gap-1.5">
              {canToggle ? (
                <PaymentToggle settlementId={settlementId!} isPaid={isPaid} />
              ) : isPaid ? (
                <CheckCircle2 className="h-9 w-9 text-success" aria-label={t("settlement.paid")} />
              ) : (
                <div className="h-9 w-9" aria-hidden />
              )}

              <Arrow className="h-5 w-5 text-primary" aria-hidden />
              <p className="whitespace-nowrap text-lg font-bold text-primary sm:text-xl">{money}</p>
            </div>

            <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
              <p className="truncate text-base font-semibold sm:text-lg">{toUser.name}</p>
              {toUser.cardNumber && <CopyCardNumber value={toUser.cardNumber} compact />}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
