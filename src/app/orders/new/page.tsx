import { PageTransition, PageHeader } from "@/components/shared/page-transition";
import { OrderForm } from "@/components/orders/order-form";
import { getUsers, getRestaurants, getSettings, isCurrentWeekClosed } from "@/actions";
import { getServerI18n } from "@/i18n/server";
import { redirect } from "next/navigation";

export default async function NewOrderPage() {
  const { t } = await getServerI18n();
  const weekClosed = await isCurrentWeekClosed();
  if (weekClosed) redirect("/orders");

  const [users, restaurants, settings] = await Promise.all([
    getUsers(),
    getRestaurants(),
    getSettings(),
  ]);

  return (
    <PageTransition>
      <PageHeader title={t("orders.newTitle")} description={t("orders.newDesc")} />
      <OrderForm
        users={users}
        restaurants={restaurants}
        labPerPerson={settings.labPerPerson}
      />
    </PageTransition>
  );
}
