import { cn } from "@/lib/utils";

type Status = "healthy" | "warning" | "critical" | "degraded" | "maintenance";

interface StatusBadgeProps {
  status: Status;
  showPulse?: boolean;
  size?: "sm" | "md";
}

const statusConfig = {
  healthy: {
    label: "Healthy",
    className: "status-healthy",
    dotColor: "bg-success",
  },
  warning: {
    label: "Warning",
    className: "status-warning",
    dotColor: "bg-warning",
  },
  critical: {
    label: "Critical",
    className: "status-critical",
    dotColor: "bg-destructive",
  },
  degraded: {
    label: "Degraded",
    className: "status-warning",
    dotColor: "bg-warning",
  },
  maintenance: {
    label: "Maintenance",
    className: "status-info",
    dotColor: "bg-info",
  },
};

export function StatusBadge({
  status,
  showPulse = false,
  size = "md",
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        config.className,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      <span
        className={cn(
          "rounded-full",
          config.dotColor,
          showPulse && "pulse-dot",
          size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"
        )}
      />
      {config.label}
    </span>
  );
}
