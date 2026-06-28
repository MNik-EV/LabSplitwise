import { PageTransition, PageHeader } from "@/components/shared/page-transition";
import { UserCard } from "@/components/members/user-card";
import { DailyExpenseChart, WeeklyExpenseChart } from "@/components/dashboard/dashboard-charts";
import { Card, CardContent } from "@/components/ui/card";
import { MembersManager } from "@/components/members/members-manager";
import { getMemberStats, getReports } from "@/actions";
import { getServerI18n } from "@/i18n/server";

export default async function MembersPage() {
  const { t, formatMoney, formatCount } = await getServerI18n();
  const [members, reports] = await Promise.all([getMemberStats(), getReports()]);

  return (
    <PageTransition>
      <PageHeader
        title={t("members.title")}
        description={t("members.count", { count: members.length })}
      />

      <div className="mb-8">
        <MembersManager />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reports.topPayer && (
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{t("members.topPayer")}</p>
              <p className="mt-1 font-bold">{reports.topPayer.name}</p>
              <p className="text-sm text-primary">{formatMoney(reports.topPayer.total)}</p>
            </CardContent>
          </Card>
        )}
        {reports.topAttendance && (
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{t("members.topAttendance")}</p>
              <p className="mt-1 font-bold">{reports.topAttendance.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCount(reports.topAttendance.count)} {t("common.times")}
              </p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">{t("members.avgFood")}</p>
            <p className="mt-1 text-xl font-bold">{formatMoney(reports.avgFoodPrice)}</p>
          </CardContent>
        </Card>
        {reports.topRestaurant && (
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{t("members.topRestaurant")}</p>
              <p className="mt-1 font-bold">{reports.topRestaurant.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCount(reports.topRestaurant.count)} {t("common.orders")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <DailyExpenseChart dailyData={reports.dailyChart} title={t("members.dailyChart")} />
        <WeeklyExpenseChart dailyData={reports.weeklyChart} title={t("members.weeklyChart")} />
      </div>

      <h2 className="mb-4 text-lg font-semibold">{t("members.list")}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member, i) => (
          <UserCard
            key={member.id}
            user={{
              id: member.id,
              name: member.name,
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
    </PageTransition>
  );
}
