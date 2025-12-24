import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ResourceCard } from "@/components/dashboard/ResourceCard";
import { OperationsPanel } from "@/components/dashboard/OperationsPanel";
import { SLAChart } from "@/components/dashboard/SLAChart";
import { IncidentsList } from "@/components/dashboard/IncidentsList";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useAzureMonitor } from "@/hooks/useAzureMonitor";
import {
  Server,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const Index = () => {
  const {
    subscriptions,
    selectedSubscription,
    setSelectedSubscription,
    resources,
    alerts,
    summary,
    loading,
    error,
    refresh,
  } = useAzureMonitor();

  const hasAzureData = resources.length > 0 || summary !== null;

  const healthyCount = resources.filter(r => r.status === 'healthy').length;
  const healthPercentage = resources.length > 0 
    ? Math.round((healthyCount / resources.length) * 100) 
    : 0;
  const avgUptime = resources.length > 0
    ? (resources.reduce((acc, r) => acc + (r.uptime || 99.9), 0) / resources.length).toFixed(2)
    : "0";

  const metrics = [
    {
      title: "Total Resources",
      value: summary?.totalResources?.toString() ?? resources.length.toString(),
      change: 12,
      changeLabel: "vs last month",
      icon: <Server className="w-5 h-5" />,
      status: "healthy" as const,
    },
    {
      title: "Overall Health",
      value: `${healthPercentage}%`,
      change: 0.3,
      changeLabel: "vs yesterday",
      icon: <Activity className="w-5 h-5" />,
      status: healthPercentage >= 90 ? "healthy" as const : healthPercentage >= 70 ? "warning" as const : "critical" as const,
    },
    {
      title: "Active Incidents",
      value: summary?.activeIncidents?.toString() ?? alerts.length.toString(),
      change: -2,
      changeLabel: "vs yesterday",
      icon: <AlertTriangle className="w-5 h-5" />,
      status: (summary?.criticalIncidents ?? 0) > 0 ? "critical" as const : alerts.length > 0 ? "warning" as const : "healthy" as const,
    },
    {
      title: "SLA Compliance",
      value: `${avgUptime}%`,
      change: 0.02,
      changeLabel: "30-day avg",
      icon: <CheckCircle2 className="w-5 h-5" />,
      status: parseFloat(avgUptime) >= 99.9 ? "healthy" as const : "warning" as const,
    },
    {
      title: "Healthy Resources",
      value: summary?.healthyResources?.toString() ?? healthyCount.toString(),
      change: 0,
      changeLabel: "currently",
      icon: <TrendingUp className="w-5 h-5" />,
      status: "info" as const,
    },
    {
      title: "Critical Incidents",
      value: summary?.criticalIncidents?.toString() ?? "0",
      change: 0,
      changeLabel: "currently",
      icon: <Clock className="w-5 h-5" />,
      status: (summary?.criticalIncidents ?? 0) > 0 ? "critical" as const : "healthy" as const,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your infrastructure health and operations
            </p>
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading Azure data...</span>
                </>
              ) : error ? (
                <>
                  <span className="w-2 h-2 bg-destructive rounded-full" />
                  <span className="text-destructive">{error}</span>
                </>
              ) : hasAzureData ? (
                <>
                  <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span>Connected to Azure ({resources.length} resources)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-warning rounded-full" />
                  <span>No Azure data - select a subscription</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts & Resources */}
          <div className="lg:col-span-2 space-y-6">
            <SLAChart />

            {/* Resources Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Critical Resources</h2>
                <a href="/resources" className="text-sm text-primary hover:underline">
                  View all resources →
                </a>
              </div>
              {resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {resources.slice(0, 6).map((resource) => (
                    <ResourceCard
                      key={resource.name}
                      name={resource.name}
                      type={resource.type as any}
                      status={resource.status as any}
                      region={resource.region}
                      uptime={typeof resource.uptime === 'number' ? resource.uptime : 99.9}
                      cpu={resource.cpu}
                      memory={resource.memory}
                      subscription={resource.subscription}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-card p-8 text-center">
                  <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {loading ? "Loading resources from Azure..." : "No resources found. Select a subscription above."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Operations & Incidents */}
          <div className="space-y-6">
            <QuickActions onRefresh={refresh} loading={loading} />
            <OperationsPanel />
            <IncidentsList alerts={alerts} loading={loading} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
