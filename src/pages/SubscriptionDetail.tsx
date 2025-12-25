import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAzureMonitor } from "@/hooks/useAzureMonitor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Server, 
  AlertTriangle, 
  Activity, 
  Loader2,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { ResourceCard } from "@/components/dashboard/ResourceCard";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function SubscriptionDetail() {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const { 
    subscriptions, 
    resources, 
    alerts,
    summary,
    loading, 
    error,
    setSelectedSubscription,
    refresh
  } = useAzureMonitor();

  const subscription = subscriptions.find(s => s.subscriptionId === subscriptionId);

  useEffect(() => {
    if (subscriptionId) {
      setSelectedSubscription(subscriptionId);
    }
  }, [subscriptionId, setSelectedSubscription]);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/subscriptions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {subscription?.displayName || "Subscription"}
              </h1>
              {subscription && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    subscription.state === "Enabled" 
                      ? "bg-success/20 text-success border-success/30"
                      : "bg-muted text-muted-foreground border-border"
                  )}
                >
                  {subscription.state}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-mono">{subscriptionId}</p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="glass-card p-6 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Server className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{resources.length}</p>
                    <p className="text-sm text-muted-foreground">Total Resources</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {resources.filter(r => r.status === 'healthy').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Healthy Resources</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{alerts.length}</p>
                    <p className="text-sm text-muted-foreground">Active Alerts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources by Type */}
            {summary?.resourcesByType && Object.keys(summary.resourcesByType).length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Resources by Type</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Object.entries(summary.resourcesByType).map(([type, count]) => (
                    <div key={type} className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-lg font-semibold text-foreground">{count}</p>
                      <p className="text-xs text-muted-foreground capitalize">{type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Alerts */}
            {alerts.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Active Alerts</h2>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={cn(
                          "w-5 h-5",
                          alert.severity === "Sev0" || alert.severity === "Sev1" 
                            ? "text-destructive" 
                            : alert.severity === "Sev2" 
                              ? "text-warning" 
                              : "text-muted-foreground"
                        )} />
                        <div>
                          <p className="font-medium text-foreground">{alert.name}</p>
                          <p className="text-sm text-muted-foreground">{alert.resource}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{alert.severity}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Grid */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">All Resources</h2>
              {resources.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No resources found in this subscription</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {resources.map((resource) => (
                    <Link key={resource.id} to={`/resources/${encodeURIComponent(resource.id)}`}>
                      <ResourceCard 
                        name={resource.name}
                        type={resource.type}
                        status={resource.status}
                        region={resource.region}
                        uptime={resource.uptime}
                        cpu={resource.cpu}
                        memory={resource.memory}
                        subscription={resource.subscription}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
