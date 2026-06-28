"use client";

import { useTransition } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { toggleSettlementPaid } from "@/actions";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/layout/i18n-provider";

interface PaymentToggleProps {
  settlementId: string;
  isPaid: boolean;
  disabled?: boolean;
}

export function PaymentToggle({ settlementId, isPaid, disabled }: PaymentToggleProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useI18n();

  const toggle = () => {
    startTransition(async () => {
      try {
        const next = await toggleSettlementPaid(settlementId);
        toast.success(next ? t("settlement.markedPaid") : t("settlement.markedUnpaid"));
        router.refresh();
      } catch {
        toast.error(t("settlement.paymentToggleError"));
      }
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled || isPending}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
        isPaid
          ? "border-success bg-success/10 text-success hover:bg-success/15"
          : "border-muted-foreground/30 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
        isPending && "opacity-60",
      )}
    >
      {isPaid ? (
        <CheckCircle2 className="h-5 w-5 shrink-0" />
      ) : (
        <Circle className="h-5 w-5 shrink-0" />
      )}
      {isPaid ? t("settlement.paid") : t("settlement.markAsPaid")}
    </button>
  );
}
