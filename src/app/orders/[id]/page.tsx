import { PageTransition, PageHeader } from "@/components/shared/page-transition";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import { getOrder } from "@/actions";
import { getServerI18n } from "@/i18n/server";
import { formatLocalizedDate } from "@/lib/format";
import { notFound } from "next/navigation";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const { locale } = await getServerI18n();

  return (
    <PageTransition>
      <PageHeader
        title={order.restaurant.name}
        description={formatLocalizedDate(order.date, locale)}
      />
      <OrderDetailView order={order} />
    </PageTransition>
  );
}
