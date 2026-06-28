"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Users, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatLocalizedShort } from "@/lib/format";
import { DeleteOrderDialog } from "@/components/orders/delete-order-dialog";
import { useI18n } from "@/components/layout/i18n-provider";

interface OrderCardProps {
  order: {
    id: string;
    date: Date | string;
    totalAmount: number;
    restaurant: { name: string };
    payer: { id: string; name: string };
    members: { id: string }[];
  };
  readOnly?: boolean;
}

export function OrderCard({ order, readOnly = false }: OrderCardProps) {
  const { t, formatMoney, locale, dir } = useI18n();
  const Chevron = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group overflow-hidden">
        <CardContent className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{order.restaurant.name}</h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {formatLocalizedShort(order.date, locale)}
              </div>
            </div>
            <Badge variant="secondary">{formatMoney(order.totalAmount)}</Badge>
          </div>

          <div className="mb-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {order.members.length} {t("common.people")}
            </div>
            <div>
              {t("common.payer")}:{" "}
              <span className="font-medium text-foreground">{order.payer.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/orders/${order.id}`}>
                <Eye className="h-3.5 w-3.5" />
                {t("common.details")}
              </Link>
            </Button>
            {!readOnly && (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link href={`/orders/${order.id}/edit`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <DeleteOrderDialog orderId={order.id} restaurantName={order.restaurant.name}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </DeleteOrderDialog>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
              asChild
            >
              <Link href={`/orders/${order.id}`}>
                <Chevron className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
