import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Incident {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "investigating" | "identified" | "monitoring" | "resolved";
  service: string;
  createdAt: string;
  updatedAt: string;
}

const incidents: Incident[] = [
  {
    id: "INC-2024-001",
    title: "Elevated error rates on API Gateway",
    severity: "high",
    status: "identified",
    service: "API Gateway",
    createdAt: "15 min ago",
    updatedAt: "5 min ago",
  },
  {
    id: "INC-2024-002",
    title: "Database connection timeouts",
    severity: "critical",
    status: "investigating",
    service: "PostgreSQL Cluster",
    createdAt: "32 min ago",
    updatedAt: "2 min ago",
  },
  {
    id: "INC-2024-003",
    title: "CDN cache invalidation delay",
    severity: "medium",
    status: "monitoring",
    service: "CDN",
    createdAt: "1 hour ago",
    updatedAt: "20 min ago",
  },
];

const severityConfig = {
  critical: { className: "bg-destructive/20 text-destructive border-destructive/30", icon: XCircle },
  high: { className: "bg-warning/20 text-warning border-warning/30", icon: AlertTriangle },
  medium: { className: "bg-info/20 text-info border-info/30", icon: AlertTriangle },
  low: { className: "bg-muted text-muted-foreground border-border", icon: Clock },
};

const statusConfig = {
  investigating: { label: "Investigating", className: "text-destructive" },
  identified: { label: "Identified", className: "text-warning" },
  monitoring: { label: "Monitoring", className: "text-info" },
  resolved: { label: "Resolved", className: "text-success" },
};

export function IncidentsList() {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-foreground">Active Incidents</h2>
          <p className="text-sm text-muted-foreground">3 ongoing incidents</p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {incidents.map((incident) => {
          const SeverityIcon = severityConfig[incident.severity].icon;
          
          return (
            <div
              key={incident.id}
              className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer border-l-2"
              style={{
                borderLeftColor: incident.severity === "critical" 
                  ? "hsl(var(--destructive))" 
                  : incident.severity === "high"
                  ? "hsl(var(--warning))"
                  : "hsl(var(--info))"
              }}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                  severityConfig[incident.severity].className
                )}>
                  <SeverityIcon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">
                      {incident.id}
                    </span>
                    <Badge variant="outline" className={cn("text-xs", statusConfig[incident.status].className)}>
                      {statusConfig[incident.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground mt-1 truncate">
                    {incident.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{incident.service}</span>
                    <span>•</span>
                    <span>Updated {incident.updatedAt}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
