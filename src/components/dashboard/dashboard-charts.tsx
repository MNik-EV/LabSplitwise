"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLocalizedShort } from "@/lib/format";
import { useI18n } from "@/components/layout/i18n-provider";
import { cn } from "@/lib/utils";

interface ChartDataPoint {
  date: string;
  amount: number;
}

interface DashboardChartsProps {
  dailyData: ChartDataPoint[];
  title?: string;
  description?: string;
  variant?: "default" | "stats";
}

function ChartTooltip({
  active,
  payload,
  label,
  locale,
  formatMoney,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  locale: "fa" | "en";
  formatMoney: (n: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-background/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <p className="text-xs text-muted-foreground">
        {label ? formatLocalizedShort(label, locale) : ""}
      </p>
      <p className="text-base font-bold text-primary">{formatMoney(payload[0].value)}</p>
    </div>
  );
}

function ChartSkeleton({ tall }: { tall?: boolean }) {
  return <Skeleton className={cn("w-full rounded-xl", tall ? "h-[280px]" : "h-[220px]")} />;
}

const axisProps = {
  tick: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
  tickLine: false as const,
  axisLine: false as const,
};

export function DailyExpenseChart({
  dailyData,
  title,
  description,
  variant = "default",
}: DashboardChartsProps) {
  const { t, locale, formatMoney } = useI18n();
  const [mounted, setMounted] = useState(false);
  const chartTitle = title ?? t("dashboard.dailyChart");
  const tall = variant === "stats";

  useEffect(() => setMounted(true), []);

  const data = dailyData.map((d) => ({
    ...d,
    label: formatLocalizedShort(d.date, locale),
  }));

  const chartHeight = tall ? 280 : 220;

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{chartTitle}</CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="pb-4">
        {!mounted ? (
          <ChartSkeleton tall={tall} />
        ) : data.length === 0 ? (
          <div
            className="flex items-center justify-center rounded-xl border border-dashed bg-muted/20 text-sm text-muted-foreground"
            style={{ height: chartHeight }}
          >
            {t("common.noData")}
          </div>
        ) : (
          <div className="w-full min-w-0" style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.6}
                />
                <XAxis dataKey="label" {...axisProps} dy={8} />
                <YAxis
                  {...axisProps}
                  width={36}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}`}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--primary) / 0.06)", radius: 8 }}
                  content={
                    <ChartTooltip locale={locale} formatMoney={formatMoney} />
                  }
                />
                <Bar
                  dataKey="amount"
                  fill="url(#barGradient)"
                  radius={[8, 8, 2, 2]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WeeklyExpenseChart({
  dailyData,
  title,
  description,
  variant = "default",
}: DashboardChartsProps) {
  const { t, locale, formatMoney } = useI18n();
  const [mounted, setMounted] = useState(false);
  const chartTitle = title ?? t("dashboard.weeklyChart");
  const tall = variant === "stats";

  useEffect(() => setMounted(true), []);

  const data = dailyData.map((d) => ({
    ...d,
    label: formatLocalizedShort(d.date, locale),
  }));

  const chartHeight = tall ? 280 : 220;

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{chartTitle}</CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="pb-4">
        {!mounted ? (
          <ChartSkeleton tall={tall} />
        ) : data.length === 0 ? (
          <div
            className="flex items-center justify-center rounded-xl border border-dashed bg-muted/20 text-sm text-muted-foreground"
            style={{ height: chartHeight }}
          >
            {t("common.noData")}
          </div>
        ) : (
          <div className="w-full min-w-0" style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.6}
                />
                <XAxis dataKey="label" {...axisProps} dy={8} />
                <YAxis
                  {...axisProps}
                  width={36}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}`}
                />
                <Tooltip
                  content={
                    <ChartTooltip locale={locale} formatMoney={formatMoney} />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#areaGradient)"
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
