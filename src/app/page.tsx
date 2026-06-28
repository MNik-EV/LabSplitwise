import Link from "next/link";
import { PlusCircle, ArrowLeftRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatisticsCard } from "@/components/dashboard/statistics-card";
import { DailyExpenseChart } from "@/components/dashboard/dashboard-charts";
import { OrderCard } from "@/components/orders/order-card";
import { PageTransition, PageHeader } from "@/components/shared/page-transition";
import { getDashboardStats, getSettings, getReports } from "@/actions";
import { getServerI18n } from "@/i18n/server";
import { formatLocalizedDate, getInitials, getAvatarColor } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const { t, locale, formatMoney } = await getServerI18n();
  const settings = await getSettings();
  const stats = await getDashboardStats(settings.weekStartDay);
  const reports = await getReports();

  return (
    <PageTransition>
      <PageHeader
        title={t("dashboard.title")}
        description={t("dashboard.weekRange", {
          start: formatLocalizedDate(stats.weekStart, locale),
          end: formatLocalizedDate(stats.weekEnd, locale),
        })}
        action={
          <Button asChild>
            <Link href="/orders/new">
              <PlusCircle className="h-4 w-4" />
              {t("dashboard.newOrder")}
            </Link>
          </Button>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatisticsCard title={t("dashboard.totalWeek")} value={stats.totalExpenses} icon="wallet" variant="primary" />
        <StatisticsCard title={t("dashboard.orderCount")} value={stats.totalOrders} icon="shopping" isCurrency={false} />
        <StatisticsCard title={t("dashboard.labPayment")} value={stats.labContribution} icon="building" variant="success" />
        <StatisticsCard title={t("dashboard.memberPaid")} value={stats.memberPaid} icon="handcoins" variant="warning" />
        <StatisticsCard title={t("dashboard.remaining")} value={stats.remainingBalance} icon="scale" variant="danger" />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailyExpenseChart dailyData={stats.chartData} title={t("dashboard.dailyChart")} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("dashboard.quickActions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/orders/new">
                <PlusCircle className="h-4 w-4" />
                {t("nav.newOrder")}
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/settlement">
                <ArrowLeftRight className="h-4 w-4" />
                {t("nav.settlement")}
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/members">
                <BarChart3 className="h-4 w-4" />
                {t("nav.members")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("dashboard.recentOrders")}</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/orders">{t("common.viewAll")}</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">{t("dashboard.noOrders")}</p>
            ) : (
              stats.recentOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">{t("dashboard.activeMembers")}</h2>
          <Card>
            <CardContent className="p-4">
              {stats.activeMembers.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  {t("dashboard.noActiveMembers")}
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.activeMembers.map((member, i) => (
                    <div
                      key={member.user.id}
                      className="flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-sm font-medium text-muted-foreground">
                          {i + 1}
                        </span>
                        <Avatar className={cn("h-9 w-9", getAvatarColor(member.user.name))}>
                          <AvatarFallback className="bg-transparent text-sm text-white">
                            {getInitials(member.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.count} {t("common.attendance")}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{formatMoney(member.totalSpent)}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {reports.topRestaurant && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  {t("dashboard.stats")}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t("dashboard.topRestaurant")}</p>
                    <p className="font-medium">{reports.topRestaurant.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("dashboard.avgFoodPrice")}</p>
                    <p className="font-medium">{formatMoney(reports.avgFoodPrice)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
