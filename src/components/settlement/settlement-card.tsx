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

export function SettlementCard({
  fromUser,
  toUser,
  amount,
  isPaid = false,
  index = 0,
}: SettlementCardProps) {
  const { t, formatMoney, dir } = useI18n();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <motion.div
      initial={{ opacity: 0, x: dir === "rtl" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={cn(isPaid && "opacity-60")}>
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <Avatar className={cn("h-10 w-10", getAvatarColor(fromUser.name))}>
              <AvatarFallback className="bg-transparent text-white">
                {getInitials(fromUser.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{fromUser.name}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Arrow className="h-3 w-3" />
                {toUser.name}
              </div>
            </div>
          </div>
          <div className="text-end">
            <p className="text-lg font-bold text-primary">{formatMoney(amount)}</p>
            {isPaid && <Badge variant="success">{t("settlement.paid")}</Badge>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
