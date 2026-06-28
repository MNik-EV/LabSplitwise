"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/layout/i18n-provider";

interface TransferItem {
  fromUser: { name: string };
  toUser: { name: string };
  amount: number;
}

interface ShareSettlementButtonProps {
  transfers: TransferItem[];
  weekLabel?: string;
}

export function ShareSettlementButton({ transfers, weekLabel }: ShareSettlementButtonProps) {
  const { t, formatMoney } = useI18n();
  const [copied, setCopied] = useState(false);

  if (transfers.length === 0) return null;

  const buildText = () => {
    const lines = [
      weekLabel ? `📋 ${weekLabel}` : `📋 ${t("settlement.title")}`,
      "",
      ...transfers.map((tr) =>
        t("settlement.transferLine", {
          from: tr.fromUser.name,
          to: tr.toUser.name,
          amount: formatMoney(tr.amount),
        }),
      ),
    ];
    return lines.join("\n");
  };

  const handleShare = async () => {
    const text = buildText();
    try {
      if (navigator.share) {
        await navigator.share({ text, title: t("settlement.title") });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(t("settlement.shareCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(t("settlement.shareCopied"));
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error(t("settlement.shareError"));
      }
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} aria-label={t("settlement.share")}>
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? t("settlement.shareCopied") : t("settlement.share")}
    </Button>
  );
}
