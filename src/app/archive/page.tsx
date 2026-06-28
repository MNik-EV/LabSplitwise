import Link from "next/link";
import { Archive, ChevronLeft, ChevronRight } from "lucide-react";
import { PageTransition, PageHeader } from "@/components/shared/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClosePendingWeekButton } from "@/components/settlement/close-pending-week-button";
import { getArchivedWeeks, getSettings } from "@/actions";
import { getServerI18n } from "@/i18n/server";
import { localeConfig } from "@/config/defaults";
import { formatLocalizedDate } from "@/lib/format";
import { weekKeyFromDate } from "@/lib/week";

export default async function ArchivePage() {
  const { t, locale, formatMoney } = await getServerI18n();
  const { dir } = localeConfig[locale];
  const settings = await getSettings();
  const { closed, pending } = await getArchivedWeeks(settings.weekStartDay);
  const Chevron = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <PageTransition>
      <PageHeader title={t("archive.title")} description={t("archive.desc")} />

      {pending.length > 0 && (
        <div className="mb-8 space-y-3">
          <h2 className="text-lg font-semibold">{t("archive.pendingTitle")}</h2>
          {pending.map((week) => (
            <Card key={week.weekKey} className="border-warning/30">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">
                    {t("settlement.weekRange", {
                      start: formatLocalizedDate(week.weekStart, locale),
                      end: formatLocalizedDate(week.weekEnd, locale),
                    })}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("archive.weekSummary", {
                      orders: week.totalOrders,
                      paid: week.paidTransfers,
                      total: week.totalTransfers,
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ClosePendingWeekButton
                    weekKey={week.weekKey}
                    weekStartDay={settings.weekStartDay}
                  />
                  <Link
                    href={`/archive/${week.weekKey}`}
                    className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm hover:bg-accent"
                  >
                    {t("archive.viewDetails")}
                    <Chevron className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <h2 className="mb-4 text-lg font-semibold">{t("archive.closedTitle")}</h2>

      {closed.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Archive className="mx-auto mb-3 h-10 w-10 opacity-40" />
            {t("archive.empty")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {closed.map((week) => {
            const allPaid =
              week.totalTransfers > 0 && week.paidTransfers === week.totalTransfers;
            const weekKey = weekKeyFromDate(week.weekStart);

            return (
              <Link key={week.id} href={`/archive/${weekKey}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">
                        {t("settlement.weekRange", {
                          start: formatLocalizedDate(week.weekStart, locale),
                          end: formatLocalizedDate(week.weekEnd, locale),
                        })}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatMoney(week.totalExpenses)} · {week.totalOrders}{" "}
                        {t("common.orders")}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={allPaid ? "success" : "secondary"}>
                        {t("settlement.paymentProgress", {
                          paid: week.paidTransfers,
                          total: week.totalTransfers,
                        })}
                      </Badge>
                      <Chevron className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
