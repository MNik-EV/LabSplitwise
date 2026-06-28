"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatLocalizedShort } from "@/lib/format";
import { useI18n } from "@/components/layout/i18n-provider";

interface ChartDataPoint {
  date: string;
  amount: number;
}

interface DashboardChartsProps {
  dailyData: ChartDataPoint[];
  title?: string;
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
    <div className="rounded-xl border bg-background p-3 shadow-lg">
      <p className="text-sm text-muted-foreground">
        {label ? formatLocalizedShort(label, locale) : ""}
      </p>
      <p className="font-bold">{formatMoney(payload[0].value)}</p>
    </div>
  );
}

export function DailyExpenseChart({ dailyData, title }: DashboardChartsProps) {
  const { t, locale, formatMoney } = useI18n();
  const chartTitle = title ?? t("dashboard.dailyChart");

  const data = dailyData.map((d) => ({
    ...d,
    label: formatLocalizedShort(d.date, locale),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{chartTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-muted-foreground">
            {t("common.noData")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                content={
                  <ChartTooltip locale={locale} formatMoney={formatMoney} />
                }
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function WeeklyExpenseChart({ dailyData, title }: DashboardChartsProps) {
  const { t, locale, formatMoney } = useI18n();
  const chartTitle = title ?? t("dashboard.weeklyChart");

  const data = dailyData.map((d) => ({
    ...d,
    label: formatLocalizedShort(d.date, locale),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{chartTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-muted-foreground">
            {t("common.noData")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                content={
                  <ChartTooltip locale={locale} formatMoney={formatMoney} />
                }
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
