import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  status?: "healthy" | "warning" | "critical" | "info";
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  status = "info",
}: MetricCardProps) {
  const statusStyles = {
    healthy: "border-success/30 hover:border-success/50",
    warning: "border-warning/30 hover:border-warning/50",
    critical: "border-destructive/30 hover:border-destructive/50",
    info: "border-border hover:border-primary/30",
  };

  const iconBgStyles = {
    healthy: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    critical: "bg-destructive/10 text-destructive",
    info: "bg-primary/10 text-primary",
  };

  return (
    <div
      className={cn(
        "metric-card group cursor-pointer",
        statusStyles[status]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change > 0 ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : change < 0 ? (
                <TrendingDown className="w-4 h-4 text-destructive" />
              ) : (
                <Minus className="w-4 h-4 text-muted-foreground" />
              )}
              <span
                className={cn(
                  "text-sm",
                  change > 0 && "text-success",
                  change < 0 && "text-destructive",
                  change === 0 && "text-muted-foreground"
                )}
              >
                {change > 0 ? "+" : ""}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-sm text-muted-foreground">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
            iconBgStyles[status]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
