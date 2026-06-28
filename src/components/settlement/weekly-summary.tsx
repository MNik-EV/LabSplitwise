"use client";

import { Wallet, Building2, ShoppingBag, ArrowLeftRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useI18n } from "@/components/layout/i18n-provider";

interface WeeklySummaryProps {
  totalExpenses: number;
  labContribution: number;
  totalOrders: number;
  transferCount: number;
}

export function WeeklySummary({
  totalExpenses,
  labContribution,
  totalOrders,
  transferCount,
}: WeeklySummaryProps) {
  const { t, formatMoney, formatCount } = useI18n();

  const items = [
    { label: t("settlement.totalWeek"), value: formatMoney(totalExpenses), icon: Wallet, color: "text-primary" },
    { label: t("settlement.labShare"), value: formatMoney(labContribution), icon: Building2, color: "text-success" },
    { label: t("settlement.orderCount"), value: formatCount(totalOrders), icon: ShoppingBag, color: "text-foreground" },
    { label: t("settlement.transferCount"), value: formatCount(transferCount), icon: ArrowLeftRight, color: "text-warning" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-lg font-bold">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
