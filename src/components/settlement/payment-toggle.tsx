"use client";

import { useTransition } from "react";
import { Check, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { toggleSettlementPaid } from "@/actions";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/layout/i18n-provider";

interface PaymentToggleProps {
  settlementId: string;
  isPaid: boolean;
  disabled?: boolean;
  variant?: "button" | "icon";
}

export function PaymentToggle({
  settlementId,
  isPaid,
  disabled,
  variant = "icon",
}: PaymentToggleProps) {
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

  const label = isPaid ? t("settlement.paid") : t("settlement.markAsPaid");

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={disabled || isPending}
        aria-pressed={isPaid}
        aria-label={label}
        title={label}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
          isPaid
            ? "border-success bg-success text-success-foreground shadow-sm hover:bg-success/90"
            : "border-muted-foreground/35 bg-background text-muted-foreground hover:border-primary hover:text-primary",
          isPending && "opacity-60",
        )}
      >
        {isPaid ? <Check className="h-4 w-4 stroke-[3]" /> : <Circle className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled || isPending}
      aria-pressed={isPaid}
      aria-label={label}
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
      {label}
    </button>
  );
}
