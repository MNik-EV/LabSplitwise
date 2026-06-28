"use client";

import { useTheme } from "next-themes";
import { PersianDatePicker } from "persian-date-kit";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/layout/i18n-provider";
import { parseDateInput, toDateInputValue } from "@/lib/date-input";
import { cn } from "@/lib/utils";
import "persian-date-kit/styles.css";

const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const JALALI_WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

interface LocaleDatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function LocaleDatePicker({
  id,
  value,
  onChange,
  disabled,
  className,
}: LocaleDatePickerProps) {
  const { locale, t } = useI18n();
  const { resolvedTheme } = useTheme();

  if (locale === "en") {
    return (
      <Input
        id={id}
        type="date"
        value={value}
        disabled={disabled}
        className={className}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <PersianDatePicker
        value={parseDateInput(value)}
        onChange={(date) => {
          const next = date instanceof Date ? date : null;
          onChange(toDateInputValue(next));
        }}
        disabled={disabled}
        placeholder={t("orders.datePlaceholder")}
        monthLabels={JALALI_MONTHS}
        weekdays={JALALI_WEEKDAYS}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        className="w-full dvx-pdp--fullwidth"
        classes={{
          root: "w-full",
          control: "w-full",
          input: cn(
            "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-soft",
            "ring-offset-background placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ),
          button: "rounded-xl border-input bg-background hover:bg-accent",
          popover: "rounded-2xl border border-border shadow-card",
        }}
      />
    </div>
  );
}
