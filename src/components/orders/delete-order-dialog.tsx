"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toastActionError } from "@/lib/action-error-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteOrder } from "@/actions";
import { useI18n } from "@/components/layout/i18n-provider";

interface DeleteOrderDialogProps {
  orderId: string;
  restaurantName: string;
  children: React.ReactNode;
}

export function DeleteOrderDialog({
  orderId,
  restaurantName,
  children,
}: DeleteOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useI18n();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteOrder(orderId);
        toast.success(t("orders.deleteSuccess"));
        setOpen(false);
        router.refresh();
      } catch (error) {
        toastActionError(error, t, "orders.deleteError");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("orders.deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("orders.deleteDesc", { name: restaurantName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? t("common.deleting") : t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
