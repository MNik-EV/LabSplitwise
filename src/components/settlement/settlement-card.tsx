"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials, getAvatarColor } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/layout/i18n-provider";

interface SettlementCardProps {
  fromUser: { id: string; name: string };
  toUser: { id: string; name: string };
  amount: number;
  isPaid?: boolean;
  index?: number;
}

function PersonBlock({
  name,
  role,
  roleVariant,
  action,
}: {
  name: string;
  role: string;
  roleVariant: "destructive" | "success";
  action: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 text-center">
      <Avatar className={cn("h-14 w-14", getAvatarColor(name))}>
        <AvatarFallback className="bg-transparent text-lg text-white">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <p className="text-lg font-bold">{name}</p>
      <Badge variant={roleVariant === "destructive" ? "destructive" : "success"}>
        {role}
      </Badge>
      <p className="text-xs text-muted-foreground">{action}</p>
    </div>
  );
}

export function SettlementCard({
  fromUser,
  toUser,
  amount,
  isPaid = false,
  index = 0,
}: SettlementCardProps) {
  const { t, formatMoney, dir } = useI18n();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const money = formatMoney(amount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card
        className={cn(
          "overflow-hidden border-2 transition-shadow hover:shadow-md",
          isPaid ? "border-success/30 bg-success/5 opacity-80" : "border-primary/20",
        )}
      >
        <CardContent className="p-6">
          <p className="mb-6 text-center text-base font-medium leading-relaxed">
            {t("settlement.transferLine", {
              from: fromUser.name,
              amount: money,
              to: toUser.name,
            })}
          </p>

          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <PersonBlock
              name={fromUser.name}
              role={t("settlement.debtor")}
              roleVariant="destructive"
              action={t("settlement.pays")}
            />

            <div className="flex shrink-0 flex-col items-center gap-2 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Arrow className="h-5 w-5 text-primary" />
              </div>
              <p className="whitespace-nowrap text-xl font-bold text-primary sm:text-2xl">
                {money}
              </p>
            </div>

            <PersonBlock
              name={toUser.name}
              role={t("settlement.creditor")}
              roleVariant="success"
              action={t("settlement.receives")}
            />
          </div>

          {isPaid && (
            <div className="mt-4 flex justify-center">
              <Badge variant="success" className="px-4 py-1">
                {t("settlement.paid")}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
