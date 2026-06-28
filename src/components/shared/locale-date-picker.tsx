"use client";

import { Calendar } from "lucide-react";
import { useTheme } from "next-themes";
import { PersianDatePicker } from "persian-date-kit";
import { Input } from "@/components/ui/input";
import { IconCenteredField } from "@/components/shared/icon-centered-field";
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
  invalid?: boolean;
}

export function LocaleDatePicker({
  id,
  value,
  onChange,
  disabled,
  className,
  invalid,
}: LocaleDatePickerProps) {
  const { locale, t } = useI18n();
  const { resolvedTheme } = useTheme();

  if (locale === "en") {
    return (
      <IconCenteredField icon={Calendar} className={className} invalid={invalid}>
        <Input
          id={id}
          type="date"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      </IconCenteredField>
    );
  }

  return (
    <IconCenteredField icon={Calendar} className={className} invalid={invalid}>
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
        className="w-full dvx-pdp--fullwidth dvx-pdp--centered"
        classes={{
          root: "w-full",
          control: "w-full border-0 bg-transparent p-0 shadow-none",
          input: cn(
            "h-10 w-full border-0 bg-transparent px-0 py-0 text-center text-sm shadow-none",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ),
          popover: "rounded-2xl border border-border shadow-card",
        }}
      />
    </IconCenteredField>
  );
}
