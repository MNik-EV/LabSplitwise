import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconCenteredFieldProps {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  invalid?: boolean;
}

export function IconCenteredField({
  icon: Icon,
  children,
  className,
  invalid,
}: IconCenteredFieldProps) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-full items-center rounded-xl border border-input bg-background shadow-soft",
        "ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        invalid && "border-destructive focus-within:ring-destructive",
        className,
      )}
    >
      <Icon
        className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <div
        className={cn(
          "flex w-full items-center justify-center px-10",
          "[&_input]:h-10 [&_input]:w-full [&_input]:border-0 [&_input]:bg-transparent [&_input]:text-center [&_input]:text-sm [&_input]:shadow-none",
          "[&_input]:focus-visible:outline-none [&_input]:focus-visible:ring-0 [&_input]:focus-visible:ring-offset-0",
          "[&_input]:disabled:cursor-not-allowed [&_input]:disabled:opacity-50",
          "[&_input[type=date]::-webkit-calendar-picker-indicator]:absolute [&_input[type=date]::-webkit-calendar-picker-indicator]:inset-0",
          "[&_input[type=date]::-webkit-calendar-picker-indicator]:cursor-pointer [&_input[type=date]::-webkit-calendar-picker-indicator]:opacity-0",
          "[&_input[type=date]::-webkit-date-and-time-value]:text-center",
          "[&_input[type=number]::-webkit-inner-spin-button]:appearance-none [&_input[type=number]::-webkit-outer-spin-button]:appearance-none",
          "[&_input[type=number]]:[-moz-appearance:textfield]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
