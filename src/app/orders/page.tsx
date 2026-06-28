import Link from "next/link";
import { PlusCircle, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderCard } from "@/components/orders/order-card";
import { OrdersEmpty } from "@/components/orders/orders-empty";
import { PageTransition, PageHeader } from "@/components/shared/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { getOrders, getSettings, isCurrentWeekClosed } from "@/actions";
import { getServerI18n } from "@/i18n/server";
import { getWeekRange } from "@/lib/utils";
import { formatLocalizedDate } from "@/lib/format";

export default async function OrdersPage() {
  const { t, locale } = await getServerI18n();
  const settings = await getSettings();
  const { start, end } = getWeekRange(new Date(), settings.weekStartDay);
  const [orders, weekClosed] = await Promise.all([
    getOrders({ weekStart: start, weekEnd: end, currentWeekOnly: false }),
    isCurrentWeekClosed(),
  ]);

  return (
    <PageTransition>
      <PageHeader
        title={t("orders.title")}
        description={t("orders.currentWeekDesc", {
          start: formatLocalizedDate(start, locale),
          end: formatLocalizedDate(end, locale),
          count: orders.length,
        })}
        action={
          !weekClosed ? (
            <Button asChild>
              <Link href="/orders/new">
                <PlusCircle className="h-4 w-4" />
                {t("orders.new")}
              </Link>
            </Button>
          ) : undefined
        }
      />

      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            {weekClosed ? t("orders.weekClosedHint") : t("orders.currentWeekOnly")}
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/archive">
              <Archive className="h-4 w-4" />
              {t("nav.archive")}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {orders.length === 0 ? (
        <OrdersEmpty />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} readOnly={weekClosed} />
          ))}
        </div>
      )}
    </PageTransition>
  );
}
