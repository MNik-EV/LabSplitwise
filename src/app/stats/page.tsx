import { PageTransition, PageHeader } from "@/components/shared/page-transition";
import { StatisticsCard } from "@/components/dashboard/statistics-card";
import { DailyExpenseChart, WeeklyExpenseChart } from "@/components/dashboard/dashboard-charts";
import { UserCard } from "@/components/members/user-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMemberStats, getReports, getDashboardStats, getSettings } from "@/actions";
import { getServerI18n } from "@/i18n/server";
import { formatLocalizedDate } from "@/lib/format";

export default async function StatsPage() {
  const { t, locale, formatMoney, formatCount } = await getServerI18n();
  const settings = await getSettings();
  const [members, reports, weekStats] = await Promise.all([
    getMemberStats(),
    getReports(),
    getDashboardStats(settings.weekStartDay),
  ]);

  return (
    <PageTransition>
      <PageHeader
        title={t("stats.title")}
        description={t("stats.weekRange", {
          start: formatLocalizedDate(weekStats.weekStart, locale),
          end: formatLocalizedDate(weekStats.weekEnd, locale),
        })}
      />

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          {t("stats.currentWeek")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatisticsCard
            title={t("dashboard.totalWeek")}
            value={weekStats.totalExpenses}
            icon="wallet"
            variant="primary"
          />
          <StatisticsCard
            title={t("dashboard.orderCount")}
            value={weekStats.totalOrders}
            icon="shopping"
            isCurrency={false}
          />
          <StatisticsCard
            title={t("dashboard.labPayment")}
            value={weekStats.labContribution}
            icon="building"
            variant="success"
          />
          <StatisticsCard
            title={t("dashboard.memberPaid")}
            value={weekStats.memberPaid}
            icon="handcoins"
            variant="warning"
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          {t("stats.allTime")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatisticsCard
            title={t("stats.totalOrders")}
            value={reports.totalOrders}
            icon="shopping"
            isCurrency={false}
          />
          <StatisticsCard
            title={t("stats.avgFood")}
            value={reports.avgFoodPrice}
            icon="scale"
          />
          {reports.topPayer && (
            <Card className="overflow-hidden border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("stats.topPayer")}
                </p>
                <p className="mt-2 text-lg font-bold">{reports.topPayer.name}</p>
                <p className="text-sm text-primary">{formatMoney(reports.topPayer.total)}</p>
              </CardContent>
            </Card>
          )}
          {reports.topAttendance && (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("stats.topAttendance")}
                </p>
                <p className="mt-2 text-lg font-bold">{reports.topAttendance.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCount(reports.topAttendance.count)} {t("common.times")}
                </p>
              </CardContent>
            </Card>
          )}
          {reports.topRestaurant && (
            <Card className="sm:col-span-2 xl:col-span-1">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("stats.topRestaurant")}
                </p>
                <p className="mt-2 text-lg font-bold">{reports.topRestaurant.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCount(reports.topRestaurant.count)} {t("common.orders")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-2">
        <DailyExpenseChart dailyData={reports.dailyChart} title={t("stats.dailyChart")} />
        <WeeklyExpenseChart dailyData={reports.weeklyChart} title={t("stats.weeklyChart")} />
      </section>

      <section>
        <CardHeader className="px-0 pb-4">
          <CardTitle className="text-lg">{t("stats.memberBreakdown")}</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((member, i) => (
            <UserCard
              key={member.id}
              user={{
                id: member.id,
                name: member.name,
                cardNumber: member.cardNumber,
                attendance: member.attendance,
                payments: member.payments,
                totalPaid: member.totalPaid,
                credit: member.credit,
                debt: member.debt,
                avgFoodPrice: member.avgFoodPrice,
              }}
              index={i}
            />
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
