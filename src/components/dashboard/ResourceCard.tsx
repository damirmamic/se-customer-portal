import { Server, Database, Cloud, Globe, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Progress } from "@/components/ui/progress";

type ResourceType = "vm" | "database" | "storage" | "cdn" | "container";
type Status = "healthy" | "warning" | "critical" | "degraded" | "maintenance";

interface ResourceCardProps {
  name: string;
  type: ResourceType;
  status: Status;
  region: string;
  uptime: number;
  cpu?: number;
  memory?: number;
  subscription: string;
}

const resourceIcons = {
  vm: Server,
  database: Database,
  storage: HardDrive,
  cdn: Globe,
  container: Cloud,
};

const resourceLabels = {
  vm: "Virtual Machine",
  database: "Database",
  storage: "Storage",
  cdn: "CDN",
  container: "Container",
};

export function ResourceCard({
  name,
  type,
  status,
  region,
  uptime,
  cpu,
  memory,
  subscription,
}: ResourceCardProps) {
  const Icon = resourceIcons[type];

  return (
    <div className="glass-card p-4 hover:border-primary/30 transition-all duration-300 cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground">{resourceLabels[type]}</p>
          </div>
        </div>
        <StatusBadge status={status} size="sm" showPulse={status === "critical"} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Region</span>
          <span className="text-foreground">{region}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Uptime</span>
          {uptime !== null && uptime !== undefined ? (
            <span className={cn(
              uptime >= 99.9 ? "text-success" : uptime >= 99 ? "text-warning" : "text-destructive"
            )}>
              {uptime}%
            </span>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </div>

        {cpu !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">CPU</span>
              <span className="text-foreground">{cpu}%</span>
            </div>
            <Progress 
              value={cpu} 
              className={cn(
                "h-1.5",
                cpu > 90 ? "[&>div]:bg-destructive" : cpu > 70 ? "[&>div]:bg-warning" : "[&>div]:bg-success"
              )} 
            />
          </div>
        )}

        {memory !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Memory</span>
              <span className="text-foreground">{memory}%</span>
            </div>
            <Progress 
              value={memory} 
              className={cn(
                "h-1.5",
                memory > 90 ? "[&>div]:bg-destructive" : memory > 70 ? "[&>div]:bg-warning" : "[&>div]:bg-success"
              )} 
            />
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">{subscription}</p>
        </div>
      </div>
    </div>
  );
}
