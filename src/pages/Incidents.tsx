import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search,
  Filter,
  Loader2,
  ArrowUpRight,
  Users,
  MessageSquare
} from "lucide-react";
import { useAzureMonitor, AzureAlert } from "@/hooks/useAzureMonitor";
import { formatDistanceToNow } from "date-fns";

const getSeverityBadge = (severity: string) => {
  const styles: Record<string, string> = {
    Sev0: "bg-destructive/20 text-destructive border-destructive/30",
    Sev1: "bg-destructive/20 text-destructive border-destructive/30",
    Sev2: "bg-warning/20 text-warning border-warning/30",
    Sev3: "bg-info/20 text-info border-info/30",
    Sev4: "bg-muted text-muted-foreground",
  };
  return <Badge className={styles[severity] || styles.Sev4}>{severity}</Badge>;
};

const getStatusBadge = (state: string) => {
  const styles: Record<string, { icon: typeof AlertCircle; className: string }> = {
    New: { icon: AlertCircle, className: "text-destructive" },
    Acknowledged: { icon: AlertTriangle, className: "text-warning" },
    Closed: { icon: CheckCircle2, className: "text-success" },
  };
  const config = styles[state] || styles.New;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {state}
    </Badge>
  );
};

const Incidents = () => {
  const {
    subscriptions,
    selectedSubscription,
    setSelectedSubscription,
    alerts,
    loading,
    error,
  } = useAzureMonitor();

  const openAlerts = alerts.filter((a) => a.state !== "Closed").length;
  const criticalAlerts = alerts.filter(
    (a) => (a.severity === "Sev0" || a.severity === "Sev1") && a.state !== "Closed"
  ).length;

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "Unknown";
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Incidents</h1>
            <p className="text-muted-foreground">Azure Monitor alerts and incidents</p>
          </div>
          <div className="flex items-center gap-4">
            {subscriptions.length > 0 && (
              <Select
                value={selectedSubscription || undefined}
                onValueChange={setSelectedSubscription}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select subscription" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptions.map((sub) => (
                    <SelectItem key={sub.subscriptionId} value={sub.subscriptionId}>
                      {sub.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Alerts</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "-" : openAlerts}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-destructive">
                    {loading ? "-" : criticalAlerts}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Alerts</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "-" : alerts.length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-info" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "-" : alerts.filter((a) => a.state === "Closed").length}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search alerts..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="Sev0">Sev0</SelectItem>
                  <SelectItem value="Sev1">Sev1</SelectItem>
                  <SelectItem value="Sev2">Sev2</SelectItem>
                  <SelectItem value="Sev3">Sev3</SelectItem>
                  <SelectItem value="Sev4">Sev4</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="glass-card">
            <CardContent className="py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Loading alerts from Azure...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="glass-card">
            <CardContent className="py-12">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
                <p className="text-destructive font-medium">{error}</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Check your Azure connection settings
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && alerts.length === 0 && (
          <Card className="glass-card">
            <CardContent className="py-12">
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-success mb-4" />
                <p className="text-foreground font-medium">No alerts from Azure</p>
                <p className="text-muted-foreground text-sm mt-2">
                  {subscriptions.length === 0
                    ? "Connect your Azure account to view alerts"
                    : "Your Azure environment has no active alerts"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts List */}
        {!loading && !error && alerts.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Azure Alerts</CardTitle>
              <CardDescription>Showing {alerts.length} alerts from Azure Monitor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-mono text-muted-foreground">
                            {alert.id.slice(0, 12)}...
                          </span>
                          {getSeverityBadge(alert.severity)}
                          {getStatusBadge(alert.state)}
                        </div>
                        <h3 className="font-medium text-foreground mb-1">{alert.name}</h3>
                        {alert.description && (
                          <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{alert.resource}</span>
                          {alert.firedAt && (
                            <>
                              <span>•</span>
                              <span>{formatTime(alert.firedAt)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Incidents;
