"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveWeeklySettlements } from "@/actions";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/layout/i18n-provider";

interface SettlementActionsProps {
  weekStartDay: number;
}

export function SettlementActions({ weekStartDay }: SettlementActionsProps) {
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

  return (
    <Button onClick={handleSave} disabled={isPending}>
      <Save className="h-4 w-4" />
      {isPending ? t("settlement.saving") : t("settlement.save")}
    </Button>
  );
}
