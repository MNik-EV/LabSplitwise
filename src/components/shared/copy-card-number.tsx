"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCardNumber, normalizeCardNumber } from "@/lib/card-number";
import { useI18n } from "@/components/layout/i18n-provider";

interface CopyCardNumberProps {
  value: string | null | undefined;
  className?: string;
  compact?: boolean;
}

export function CopyCardNumber({ value, className, compact = false }: CopyCardNumberProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const digits = normalizeCardNumber(value ?? "");

  if (!digits) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(digits);
      setCopied(true);
      toast.success(t("members.cardCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("members.cardCopyError"));
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={t("members.copyCard")}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5",
        "text-sm font-mono text-primary transition-colors hover:bg-primary/10",
        compact && "px-2 py-1 text-xs",
        className,
      )}
    >
      <CreditCard className={cn("h-4 w-4 shrink-0", compact && "h-3.5 w-3.5")} />
      <span dir="ltr" className="tracking-wide">
        {formatCardNumber(digits)}
      </span>
      {copied ? (
        <Check className={cn("h-3.5 w-3.5 shrink-0 text-success", compact && "h-3 w-3")} />
      ) : (
        <Copy className={cn("h-3.5 w-3.5 shrink-0 opacity-60", compact && "h-3 w-3")} />
      )}
    </button>
  );
}
