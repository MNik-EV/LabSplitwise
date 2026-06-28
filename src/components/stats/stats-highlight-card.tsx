import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsHighlightCardProps {
  label: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "primary" | "success" | "warning" | "muted";
}

const variants = {
  primary: {
    card: "border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card",
    icon: "bg-primary/15 text-primary",
    subtitle: "text-primary",
  },
  success: {
    card: "border-success/25 bg-gradient-to-br from-success/10 via-card to-card",
    icon: "bg-success/15 text-success",
    subtitle: "text-success",
  },
  warning: {
    card: "border-warning/25 bg-gradient-to-br from-warning/10 via-card to-card",
    icon: "bg-warning/15 text-warning",
    subtitle: "text-warning",
  },
  muted: {
    card: "border-border bg-card",
    icon: "bg-muted text-muted-foreground",
    subtitle: "text-muted-foreground",
  },
};

export function StatsHighlightCard({
  label,
  title,
  subtitle,
  icon: Icon,
  variant = "muted",
}: StatsHighlightCardProps) {
  const styles = variants[variant];

  return (
    <Card className={cn("overflow-hidden shadow-sm", styles.card)}>
      <CardContent className="flex items-start gap-4 p-5">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            styles.icon,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 truncate text-lg font-bold">{title}</p>
          {subtitle && (
            <p className={cn("mt-0.5 text-sm font-medium", styles.subtitle)}>{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
