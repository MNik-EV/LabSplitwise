"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials, getAvatarColor } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/layout/i18n-provider";

interface UserCardProps {
  user: {
    id: string;
    name: string;
    attendance?: number;
    payments?: number;
    totalPaid?: number;
    credit?: number;
    debt?: number;
    avgFoodPrice?: number;
  };
  index?: number;
}

export function UserCard({ user, index = 0 }: UserCardProps) {
  const { t, formatMoney, formatCount } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
    >
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <Avatar className={cn("h-12 w-12", getAvatarColor(user.name))}>
              <AvatarFallback className="bg-transparent text-lg text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{user.name}</h3>
              {user.attendance !== undefined && (
                <p className="text-sm text-muted-foreground">
                  {formatCount(user.attendance)} {t("common.attendance")} ·{" "}
                  {formatCount(user.payments ?? 0)} {t("common.payments")}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {user.totalPaid !== undefined && (
              <div>
                <p className="text-muted-foreground">{t("common.paidAmount")}</p>
                <p className="font-medium">{formatMoney(user.totalPaid)}</p>
              </div>
            )}
            {user.avgFoodPrice !== undefined && (
              <div>
                <p className="text-muted-foreground">{t("common.avgFood")}</p>
                <p className="font-medium">{formatMoney(user.avgFoodPrice)}</p>
              </div>
            )}
            {user.credit !== undefined && user.credit > 0 && (
              <div>
                <p className="text-muted-foreground">{t("common.credit")}</p>
                <Badge variant="success">{formatMoney(user.credit)}</Badge>
              </div>
            )}
            {user.debt !== undefined && user.debt > 0 && (
              <div>
                <p className="text-muted-foreground">{t("common.debt")}</p>
                <Badge variant="destructive">{formatMoney(user.debt)}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
