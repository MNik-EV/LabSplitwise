"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { closeWeek } from "@/actions";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/layout/i18n-provider";

interface ClosePendingWeekButtonProps {
  weekKey: string;
  weekStartDay: number;
}

export function ClosePendingWeekButton({ weekKey, weekStartDay }: ClosePendingWeekButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useI18n();

  const handleClose = () => {
    startTransition(async () => {
      try {
        await closeWeek(weekStartDay, weekKey);
        toast.success(t("settlement.closeSuccess"));
        router.refresh();
      } catch {
        toast.error(t("settlement.closeError"));
      }
    });
  };

  return (
    <Button size="sm" variant="outline" onClick={handleClose} disabled={isPending}>
      <Archive className="h-4 w-4" />
      {isPending ? t("settlement.closing") : t("settlement.closeWeek")}
    </Button>
  );
}
