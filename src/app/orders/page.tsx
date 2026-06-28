import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderCard } from "@/components/orders/order-card";
import { OrdersEmpty } from "@/components/orders/orders-empty";
import { PageTransition, PageHeader } from "@/components/shared/page-transition";
import { getOrders } from "@/actions";
import { getServerI18n } from "@/i18n/server";

export default async function OrdersPage() {
  const { t } = await getServerI18n();
  const orders = await getOrders();

  return (
    <PageTransition>
      <PageHeader
        title={t("orders.title")}
        description={t("orders.count", { count: orders.length })}
        action={
          <Button asChild>
            <Link href="/orders/new">
              <PlusCircle className="h-4 w-4" />
              {t("orders.new")}
            </Link>
          </Button>
        }
      />

      {orders.length === 0 ? (
        <OrdersEmpty />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </PageTransition>
  );
}
