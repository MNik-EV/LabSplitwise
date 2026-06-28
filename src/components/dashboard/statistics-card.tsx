"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  ShoppingBag,
  Building2,
  HandCoins,
  Scale,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/layout/i18n-provider";

const iconMap = {
  wallet: Wallet,
  shopping: ShoppingBag,
  building: Building2,
  handcoins: HandCoins,
  scale: Scale,
} as const;

type IconName = keyof typeof iconMap;

interface StatisticsCardProps {
  title: string;
  value: number | string;
  icon: IconName;
  description?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  isCurrency?: boolean;
}

const variantStyles = {
  default: "bg-card",
  primary: "bg-primary/5 border-primary/20",
  success: "bg-success/5 border-success/20",
  warning: "bg-warning/5 border-warning/20",
  danger: "bg-destructive/5 border-destructive/20",
};

const iconStyles = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
};

export function StatisticsCard({
  title,
  value,
  icon,
  description,
  variant = "default",
  isCurrency = true,
}: StatisticsCardProps) {
  const { formatMoney, formatCount } = useI18n();
  const Icon = iconMap[icon];

  const displayValue =
    typeof value === "number"
      ? isCurrency
        ? formatMoney(value)
        : formatCount(value)
      : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn("overflow-hidden", variantStyles[variant])}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold tracking-tight">{displayValue}</p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                iconStyles[variant],
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
