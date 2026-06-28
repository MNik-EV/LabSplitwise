"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { closeWeek } from "@/actions";
import { toastActionError } from "@/lib/action-error-toast";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/layout/i18n-provider";

interface ClosePendingWeekButtonProps {
  weekKey: string;
  weekStartDay: number;
  unpaidCount?: number;
}

export function ClosePendingWeekButton({
  weekKey,
  weekStartDay,
  unpaidCount = 0,
}: ClosePendingWeekButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useI18n();

  const handleClose = () => {
    startTransition(async () => {
      try {
        await closeWeek(weekStartDay, weekKey);
        toast.success(t("settlement.closeSuccess"));
        router.refresh();
      } catch (error) {
        toastActionError(error, t, "settlement.closeError");
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={isPending}>
          <Archive className="h-4 w-4" />
          {isPending ? t("settlement.closing") : t("settlement.closeWeek")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("settlement.closeTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {unpaidCount > 0
              ? t("settlement.closeDescUnpaid", { count: unpaidCount })
              : t("settlement.closeDesc")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleClose}>
            {t("settlement.closeConfirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
