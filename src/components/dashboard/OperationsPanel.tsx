import { 
  Database, 
  RefreshCw, 
  Shield, 
  Zap, 
  Play,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Operation {
  id: string;
  name: string;
  type: "backup" | "restore" | "failover" | "scale" | "maintenance";
  status: "pending" | "running" | "completed" | "failed";
  startedAt?: string;
  duration?: string;
}

interface OperationsPanelProps {
  operations?: Operation[];
  loading?: boolean;
}

const typeIcons = {
  backup: Database,
  restore: RefreshCw,
  failover: Shield,
  scale: Zap,
  maintenance: Clock,
};

const statusConfig = {
  pending: { icon: Clock, className: "text-muted-foreground", label: "Pending" },
  running: { icon: RefreshCw, className: "text-info animate-spin", label: "Running" },
  completed: { icon: CheckCircle2, className: "text-success", label: "Completed" },
  failed: { icon: AlertCircle, className: "text-destructive", label: "Failed" },
};

export function OperationsPanel({ operations = [], loading }: OperationsPanelProps) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">Active Operations</h2>
        <Button variant="outline" size="sm">
          <Play className="w-4 h-4 mr-2" />
          New Operation
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            Loading operations...
          </div>
        ) : operations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No active operations</p>
            <p className="text-xs mt-1">Operations will appear here when running</p>
          </div>
        ) : (
          operations.map((op) => {
            const TypeIcon = typeIcons[op.type];
            const StatusConfig = statusConfig[op.status];
            const StatusIcon = StatusConfig.icon;

            return (
              <div
                key={op.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <TypeIcon className="w-4 h-4 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {op.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {op.startedAt && <span>{op.startedAt}</span>}
                    {op.duration && (
                      <>
                        <span>•</span>
                        <span>{op.duration}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusIcon className={cn("w-4 h-4", StatusConfig.className)} />
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      op.status === "running" && "border-info/50 text-info",
                      op.status === "completed" && "border-success/50 text-success",
                      op.status === "failed" && "border-destructive/50 text-destructive"
                    )}
                  >
                    {StatusConfig.label}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Button variant="ghost" className="w-full mt-3 text-muted-foreground">
        View All Operations
      </Button>
    </div>
  );
}
