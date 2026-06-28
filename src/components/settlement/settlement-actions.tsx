"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Save, Archive } from "lucide-react";
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
import { saveWeeklySettlements, closeWeek } from "@/actions";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/layout/i18n-provider";

interface SettlementActionsProps {
  weekStartDay: number;
  isClosed?: boolean;
  weekKey?: string;
  totalOrders?: number;
}

export function SettlementActions({
  weekStartDay,
  isClosed = false,
  weekKey,
  totalOrders = 0,
}: SettlementActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useI18n();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveWeeklySettlements(weekStartDay);
        toast.success(t("settlement.saveSuccess"));
        router.refresh();
      } catch {
        toast.error(t("settlement.saveError"));
      }
    });
  };

  const handleClose = () => {
    startTransition(async () => {
      try {
        await closeWeek(weekStartDay, weekKey);
        toast.success(t("settlement.closeSuccess"));
        router.push("/archive");
        router.refresh();
      } catch {
        toast.error(t("settlement.closeError"));
      }
    });
  };

  if (isClosed) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={handleSave} disabled={isPending}>
        <Save className="h-4 w-4" />
        {isPending ? t("settlement.saving") : t("settlement.save")}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button disabled={isPending || totalOrders === 0}>
            <Archive className="h-4 w-4" />
            {t("settlement.closeWeek")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settlement.closeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("settlement.closeDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose}>
              {t("settlement.closeConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
