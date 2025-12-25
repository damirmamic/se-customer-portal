import { MainLayout } from "@/components/layout/MainLayout";
import { SLAChart } from "@/components/dashboard/SLAChart";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Activity, Clock, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { useAzureMonitor } from "@/hooks/useAzureMonitor";

export default function Health() {
  const { resources, loading, error } = useAzureMonitor();

  // Derive health data from resources
  const healthyCount = resources.filter(r => r.status === 'healthy').length;
  const warningCount = resources.filter(r => r.status === 'warning').length;
  const criticalCount = resources.filter(r => r.status === 'critical').length;
  const totalCount = resources.length;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Health & SLA</h1>
          <p className="text-muted-foreground">
            Monitor service health and SLA compliance metrics
          </p>
        </div>

        {/* Health Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Resources</span>
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">
                {loading ? "—" : totalCount}
              </span>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Healthy</span>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-success">
                {loading ? "—" : healthyCount}
              </span>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Warning</span>
              <AlertTriangle className="w-4 h-4 text-warning" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-warning">
                {loading ? "—" : warningCount}
              </span>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Critical</span>
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-destructive">
                {loading ? "—" : criticalCount}
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <SLAChart />

        {/* Resources Health */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-foreground mb-4">Resource Health</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No resources to display</p>
            </div>
          ) : (
            <div className="space-y-4">
              {resources.slice(0, 10).map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-foreground">{resource.name}</h3>
                      <StatusBadge status={resource.status} size="sm" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">{resource.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Region:</span>
                        <span className="font-medium">{resource.region}</span>
                      </div>
                      {resource.cpu !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">CPU:</span>
                          <span className={cn(
                            "font-medium",
                            resource.cpu <= 70 ? "text-success" : resource.cpu <= 85 ? "text-warning" : "text-destructive"
                          )}>
                            {resource.cpu}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-32">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Health</span>
                      <span>{resource.status === 'healthy' ? '100%' : resource.status === 'warning' ? '70%' : '30%'}</span>
                    </div>
                    <Progress 
                      value={resource.status === 'healthy' ? 100 : resource.status === 'warning' ? 70 : 30} 
                      className={cn(
                        "h-2",
                        resource.status === 'healthy' ? "[&>div]:bg-success" : 
                        resource.status === 'warning' ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
