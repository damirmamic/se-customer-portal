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

// Fallback mock data for when Azure is not connected
const mockResources = [
  {
    name: "prod-api-cluster-01",
    type: "container" as const,
    status: "healthy" as const,
    region: "US East",
    uptime: 99.99,
    cpu: 45,
    memory: 62,
    subscription: "Enterprise Production",
  },
  {
    name: "prod-db-primary",
    type: "database" as const,
    status: "healthy" as const,
    region: "US East",
    uptime: 99.98,
    cpu: 38,
    memory: 71,
    subscription: "Enterprise Production",
  },
  {
    name: "staging-vm-02",
    type: "vm" as const,
    status: "warning" as const,
    region: "EU West",
    uptime: 99.85,
    cpu: 89,
    memory: 82,
    subscription: "Development",
  },
  {
    name: "cdn-global",
    type: "cdn" as const,
    status: "degraded" as const,
    region: "Global",
    uptime: 99.92,
    subscription: "Enterprise Production",
  },
  {
    name: "backup-storage-01",
    type: "storage" as const,
    status: "healthy" as const,
    region: "US West",
    uptime: 100,
    subscription: "Enterprise Backup",
  },
  {
    name: "analytics-db",
    type: "database" as const,
    status: "maintenance" as const,
    region: "US Central",
    uptime: 99.95,
    cpu: 12,
    memory: 45,
    subscription: "Analytics",
  },
];

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

  const displayResources = resources.length > 0 ? resources : mockResources;
  const hasAzureData = resources.length > 0 || summary !== null;

  // Build metrics from Azure data or use defaults
  const metrics = [
    {
      title: "Total Resources",
      value: summary?.totalResources?.toString() ?? displayResources.length.toString(),
      change: 12,
      changeLabel: "vs last month",
      icon: <Server className="w-5 h-5" />,
      status: "healthy" as const,
    },
    {
      title: "Overall Health",
      value: hasAzureData 
        ? `${Math.round((displayResources.filter(r => r.status === 'healthy').length / displayResources.length) * 100)}%`
        : "98.7%",
      change: 0.3,
      changeLabel: "vs yesterday",
      icon: <Activity className="w-5 h-5" />,
      status: "healthy" as const,
    },
    {
      title: "Active Incidents",
      value: summary?.activeIncidents?.toString() ?? alerts.length.toString() ?? "3",
      change: -2,
      changeLabel: "vs yesterday",
      icon: <AlertTriangle className="w-5 h-5" />,
      status: (summary?.criticalIncidents ?? 0) > 0 ? "critical" as const : "warning" as const,
    },
    {
      title: "SLA Compliance",
      value: hasAzureData 
        ? `${(displayResources.reduce((acc, r) => acc + (r.uptime || 99.9), 0) / displayResources.length).toFixed(2)}%`
        : "99.97%",
      change: 0.02,
      changeLabel: "30-day avg",
      icon: <CheckCircle2 className="w-5 h-5" />,
      status: "healthy" as const,
    },
    {
      title: "Operations Today",
      value: "47",
      change: 23,
      changeLabel: "vs last week",
      icon: <TrendingUp className="w-5 h-5" />,
      status: "info" as const,
    },
    {
      title: "Avg Response Time",
      value: "142ms",
      change: -8,
      changeLabel: "vs last hour",
      icon: <Clock className="w-5 h-5" />,
      status: "healthy" as const,
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
                  <span>Syncing...</span>
                </>
              ) : error ? (
                <>
                  <span className="w-2 h-2 bg-warning rounded-full" />
                  <span>Using cached data</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span>{hasAzureData ? 'Connected to Azure' : 'All systems operational'}</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {displayResources.slice(0, 6).map((resource) => (
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
