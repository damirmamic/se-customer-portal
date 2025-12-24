import { AlertTriangle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AzureAlert } from "@/hooks/useAzureMonitor";
import { formatDistanceToNow } from "date-fns";

interface IncidentsListProps {
  alerts?: AzureAlert[];
  loading?: boolean;
}

const severityConfig: Record<string, { className: string; icon: typeof XCircle }> = {
  Sev0: { className: "bg-destructive/20 text-destructive border-destructive/30", icon: XCircle },
  Sev1: { className: "bg-destructive/20 text-destructive border-destructive/30", icon: XCircle },
  Sev2: { className: "bg-warning/20 text-warning border-warning/30", icon: AlertTriangle },
  Sev3: { className: "bg-info/20 text-info border-info/30", icon: AlertTriangle },
  Sev4: { className: "bg-muted text-muted-foreground border-border", icon: Clock },
};

const stateConfig: Record<string, { label: string; className: string }> = {
  New: { label: "New", className: "text-destructive" },
  Acknowledged: { label: "Acknowledged", className: "text-warning" },
  Closed: { label: "Closed", className: "text-success" },
};

// Mock data for when no Azure data is available
const mockIncidents = [
  {
    id: "INC-2024-001",
    name: "Elevated error rates on API Gateway",
    severity: "Sev2",
    state: "Acknowledged",
    resource: "API Gateway",
    firedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "INC-2024-002",
    name: "Database connection timeouts",
    severity: "Sev1",
    state: "New",
    resource: "PostgreSQL Cluster",
    firedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
  },
  {
    id: "INC-2024-003",
    name: "CDN cache invalidation delay",
    severity: "Sev3",
    state: "Acknowledged",
    resource: "CDN",
    firedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

export function IncidentsList({ alerts, loading }: IncidentsListProps) {
  const displayAlerts = alerts && alerts.length > 0 ? alerts : mockIncidents;
  const activeCount = displayAlerts.filter(a => a.state !== 'Closed').length;

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-foreground">Active Incidents</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `${activeCount} ongoing incidents`}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/incidents">View All</a>
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            Loading incidents...
          </div>
        ) : displayAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No active incidents
          </div>
        ) : (
          displayAlerts.slice(0, 5).map((alert) => {
            const config = severityConfig[alert.severity] || severityConfig.Sev4;
            const SeverityIcon = config.icon;
            const stateStyle = stateConfig[alert.state] || stateConfig.New;
            
            return (
              <div
                key={alert.id}
                className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer border-l-2"
                style={{
                  borderLeftColor: alert.severity === "Sev0" || alert.severity === "Sev1"
                    ? "hsl(var(--destructive))" 
                    : alert.severity === "Sev2"
                    ? "hsl(var(--warning))"
                    : "hsl(var(--info))"
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                    config.className
                  )}>
                    <SeverityIcon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">
                        {alert.severity}
                      </span>
                      <Badge variant="outline" className={cn("text-xs", stateStyle.className)}>
                        {stateStyle.label}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground mt-1 truncate">
                      {alert.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{alert.resource}</span>
                      <span>•</span>
                      <span>{formatTime(alert.firedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function RefreshCw(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}
