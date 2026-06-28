"use client";

import Link from "next/link";
import {
  Calendar,
  Store,
  CreditCard,
  Users,
  Building2,
  Pencil,
  ArrowRight,
  ArrowLeft,
  StickyNote,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DeleteOrderDialog } from "@/components/orders/delete-order-dialog";
import { formatLocalizedDate } from "@/lib/format";
import { useI18n } from "@/components/layout/i18n-provider";

type OrderDetail = NonNullable<Awaited<ReturnType<typeof import("@/actions").getOrder>>>;

interface OrderDetailViewProps {
  order: OrderDetail;
  readOnly?: boolean;
}

export function OrderDetailView({ order, readOnly = false }: OrderDetailViewProps) {
  const { t, formatMoney, locale, dir } = useI18n();
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;
  const ToPayerArrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const totalShared = order.expenses.reduce((s, e) => s + e.amount, 0);
  const payerPocket =
    order.members.find((m) => m.userId === order.payerId)?.pocketAmount ?? 0;
  const payerFromOthers = order.members
    .filter((m) => m.userId !== order.payerId)
    .reduce((s, m) => s + m.pocketAmount, 0);
  const payerOutOfPocket = order.totalAmount - order.labTotalAmount;

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link href="/orders">
            <BackArrow className="h-4 w-4" />
            {t("common.back")}
          </Link>
        </Button>
        {!readOnly && (
          <Button asChild>
            <Link href={`/orders/${order.id}/edit`} aria-label={t("common.edit")}>
              <Pencil className="h-4 w-4" />
              {t("common.edit")}
            </Link>
          </Button>
        )}
        {readOnly && (
          <Badge variant="secondary">{t("orders.weekClosedHint")}</Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("orders.memberList")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.members.map((member) => {
                  const sharedPortion = member.shareAmount - member.foodPrice;
                  const isPayer = member.userId === order.payerId;
                  const owesPayer = !isPayer && member.pocketAmount > 0;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-xl border p-4"
                    >
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        {isPayer && (
                          <Badge variant="secondary" className="mt-1">
                            {t("common.payer")}
                          </Badge>
                        )}
                      </div>
                      <div className="text-end">
                        <p className="font-bold">{formatMoney(member.shareAmount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("common.food")}: {formatMoney(member.foodPrice)} +{" "}
                          {t("common.shared")}: {formatMoney(sharedPortion)}
                        </p>
                        {isPayer ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {t("orders.ownShare")}: {formatMoney(payerPocket)}
                          </p>
                        ) : owesPayer ? (
                          <p className="mt-1 flex items-center justify-end gap-1 text-xs text-warning">
                            <ToPayerArrow className="h-3 w-3 shrink-0" aria-hidden />
                            <span>
                              {t("orders.owesPayer", {
                                payer: order.payer.name,
                                amount: formatMoney(member.pocketAmount),
                              })}
                            </span>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {order.expenses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("orders.sharedList")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex justify-between rounded-lg bg-muted/50 px-4 py-2 text-sm"
                    >
                      <span>{expense.name}</span>
                      <span className="font-medium">{formatMoney(expense.amount)}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between text-sm font-medium">
                    <span>{t("orders.sharedTotal")}</span>
                    <span>{formatMoney(totalShared)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {order.notes?.trim() && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <StickyNote className="h-4 w-4" />
                  {t("orders.notes")}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{t("orders.notesHint")}</p>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("orders.summary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatLocalizedDate(order.date, locale)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span>{order.restaurant.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>{order.payer.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {order.members.length} {t("common.people")}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("common.total")}</span>
                <span className="text-xl font-bold text-primary">
                  {formatMoney(order.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {t("orders.labShare")}
                </span>
                <span className="font-medium text-success">
                  {formatMoney(order.labTotalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("orders.payerSection")}</CardTitle>
              <p className="text-xs text-muted-foreground">{order.payer.name}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("orders.paidToRestaurant")}</span>
                <span>{formatMoney(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-success">
                <span className="flex items-center gap-1">
                  <Minus className="h-3 w-3" aria-hidden />
                  {t("orders.labShare")}
                </span>
                <span>{formatMoney(order.labTotalAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>{t("orders.payerOutOfPocket")}</span>
                <span className="text-primary">{formatMoney(payerOutOfPocket)}</span>
              </div>
              <div className="flex justify-between ps-3 text-muted-foreground">
                <span>{t("orders.ownShare")}</span>
                <span>{formatMoney(payerPocket)}</span>
              </div>
              <div className="flex justify-between ps-3 text-success">
                <span>{t("orders.collectFromOthers")}</span>
                <span>{formatMoney(payerFromOthers)}</span>
              </div>
            </CardContent>
          </Card>

          {!readOnly && (
            <DeleteOrderDialog orderId={order.id} restaurantName={order.restaurant.name}>
              <Button variant="destructive" className="w-full">
                {t("orders.deleteTitle")}
              </Button>
            </DeleteOrderDialog>
          )}
        </div>
      </div>
    </>
  );
}
