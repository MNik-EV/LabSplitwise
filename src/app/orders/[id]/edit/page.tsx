import { PageTransition, PageHeader } from "@/components/shared/page-transition";
import { OrderForm } from "@/components/orders/order-form";
import { getOrder, getUsers, getRestaurants, getSettings } from "@/actions";
import { getServerI18n } from "@/i18n/server";
import { notFound } from "next/navigation";

interface EditOrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = await params;
  const { t } = await getServerI18n();
  const [order, users, restaurants, settings] = await Promise.all([
    getOrder(id),
    getUsers(),
    getRestaurants(),
    getSettings(),
  ]);

  if (!order) notFound();

  const defaultValues = {
    id: order.id,
    date: order.date.toISOString().split("T")[0],
    restaurantId: order.restaurantId,
    payerId: order.payerId,
    labPerPerson: order.labPerPerson,
    notes: order.notes ?? "",
    members: order.members.map((m) => ({
      userId: m.userId,
      foodPrice: m.foodPrice,
    })),
    sharedExpenses: order.expenses.map((e) => ({
      name: e.name,
      amount: e.amount,
    })),
  };

  return (
    <PageTransition>
      <PageHeader title={t("orders.editTitle")} description={order.restaurant.name} />
      <OrderForm
        users={users}
        restaurants={restaurants}
        labPerPerson={settings.labPerPerson}
        defaultValues={defaultValues}
        mode="edit"
      />
    </PageTransition>
  );
}
