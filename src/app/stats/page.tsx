import { PageTransition, PageHeader } from "@/components/shared/page-transition";
import { StatisticsCard } from "@/components/dashboard/statistics-card";
import { DailyExpenseChart, WeeklyExpenseChart } from "@/components/dashboard/dashboard-charts";
import { StatsHighlightCard } from "@/components/stats/stats-highlight-card";
import { UserCard } from "@/components/members/user-card";
import { getMemberStats, getReports, getDashboardStats, getSettings } from "@/actions";
import { getServerI18n } from "@/i18n/server";
import { formatLocalizedDate } from "@/lib/format";
import { Trophy, Users, Store, TrendingUp } from "lucide-react";

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

      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("stats.currentWeek")}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
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

      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("stats.allTime")}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
            <StatsHighlightCard
              label={t("stats.topPayer")}
              title={reports.topPayer.name}
              subtitle={formatMoney(reports.topPayer.total)}
              icon={Trophy}
              variant="primary"
            />
          )}
          {reports.topAttendance && (
            <StatsHighlightCard
              label={t("stats.topAttendance")}
              title={reports.topAttendance.name}
              subtitle={`${formatCount(reports.topAttendance.count)} ${t("common.times")}`}
              icon={Users}
              variant="success"
            />
          )}
          {reports.topRestaurant && (
            <StatsHighlightCard
              label={t("stats.topRestaurant")}
              title={reports.topRestaurant.name}
              subtitle={`${formatCount(reports.topRestaurant.count)} ${t("common.orders")}`}
              icon={Store}
              variant="warning"
            />
          )}
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">{t("stats.chartsTitle")}</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <DailyExpenseChart
            dailyData={reports.dailyChart}
            title={t("stats.dailyChart")}
            description={t("stats.dailyChartDesc")}
            variant="stats"
          />
          <WeeklyExpenseChart
            dailyData={reports.weeklyChart}
            title={t("stats.weeklyChart")}
            description={t("stats.weeklyChartDesc")}
            variant="stats"
          />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("stats.memberBreakdown")}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((member, i) => (
            <UserCard
              key={member.id}
              user={{
                id: member.id,
                name: member.name,
                avatar: member.avatar,
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
