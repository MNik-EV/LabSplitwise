"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { CopyCardNumber } from "@/components/shared/copy-card-number";
import { useI18n } from "@/components/layout/i18n-provider";

interface UserCardProps {
  user: {
    id: string;
    name: string;
    avatar?: string | null;
    cardNumber?: string | null;
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
            <UserAvatar src={user.avatar} name={user.name} size="lg" />
            <div>
              <h3 className="font-semibold">{user.name}</h3>
              {user.cardNumber && (
                <div className="mt-1">
                  <CopyCardNumber value={user.cardNumber} compact />
                </div>
              )}
              {user.attendance !== undefined && (
                <p className="text-sm text-muted-foreground">
                  {formatCount(user.attendance)} {t("common.attendance")}{" "}
                  <span className="text-xs">({t("members.scopeAllTime")})</span>
                  {" · "}
                  {formatCount(user.payments ?? 0)} {t("common.payments")}{" "}
                  <span className="text-xs">({t("members.scopeAllTime")})</span>
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {user.totalPaid !== undefined && (
              <div>
                <p className="text-muted-foreground">
                  {t("common.paidAmount")}{" "}
                  <span className="text-xs">({t("members.scopeAllTime")})</span>
                </p>
                <p className="font-medium">{formatMoney(user.totalPaid)}</p>
              </div>
            )}
            {user.avgFoodPrice !== undefined && (
              <div>
                <p className="text-muted-foreground">
                  {t("common.avgFood")}{" "}
                  <span className="text-xs">({t("members.scopeAllTime")})</span>
                </p>
                <p className="font-medium">{formatMoney(user.avgFoodPrice)}</p>
              </div>
            )}
            {user.credit !== undefined && user.credit > 0 && (
              <div>
                <p className="text-muted-foreground">
                  {t("common.credit")}{" "}
                  <span className="text-xs">({t("members.scopeThisWeek")})</span>
                </p>
                <Badge variant="success">{formatMoney(user.credit)}</Badge>
              </div>
            )}
            {user.debt !== undefined && user.debt > 0 && (
              <div>
                <p className="text-muted-foreground">
                  {t("common.debt")}{" "}
                  <span className="text-xs">({t("members.scopeThisWeek")})</span>
                </p>
                <Badge variant="destructive">{formatMoney(user.debt)}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
