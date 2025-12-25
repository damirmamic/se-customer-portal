import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAzureMonitor } from "@/hooks/useAzureMonitor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Server, 
  Database,
  HardDrive,
  Globe,
  Cloud,
  Activity, 
  Loader2,
  RefreshCw,
  MapPin,
  Clock,
  Cpu,
  MemoryStick,
  Tag
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

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
  storage: "Storage Account",
  cdn: "CDN Profile",
  container: "Container Instance",
};

interface MetricData {
  name: string;
  value: number;
  unit: string;
  timestamp?: string;
}

export default function ResourceDetail() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const decodedResourceId = resourceId ? decodeURIComponent(resourceId) : "";
  const { 
    resources, 
    loading, 
    error,
    getResourceMetrics,
    refresh
  } = useAzureMonitor();

  const [metrics, setMetrics] = useState<MetricData[] | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const resource = resources.find(r => r.id === decodedResourceId);
  const Icon = resource ? resourceIcons[resource.type] : Server;

  useEffect(() => {
    async function fetchMetrics() {
      if (decodedResourceId) {
        setMetricsLoading(true);
        const data = await getResourceMetrics(decodedResourceId);
        setMetrics(data);
        setMetricsLoading(false);
      }
    }
    fetchMetrics();
  }, [decodedResourceId, getResourceMetrics]);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/resources">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            {resource ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{resource.name}</h1>
                    <p className="text-sm text-muted-foreground">{resourceLabels[resource.type]}</p>
                  </div>
                  <StatusBadge status={resource.status} showPulse={resource.status === "critical"} />
                </div>
              </>
            ) : (
              <h1 className="text-2xl font-bold text-foreground">Resource Details</h1>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {loading && !resource ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !resource ? (
          <div className="glass-card p-8 text-center">
            <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground font-medium">Resource not found</p>
            <p className="text-muted-foreground text-sm mt-2">
              The resource may have been deleted or you don't have access to it
            </p>
            <Link to="/resources">
              <Button variant="outline" className="mt-4">
                Back to Resources
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Region</p>
                    <p className="font-medium text-foreground">{resource.region}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <p className={cn(
                      "font-medium",
                      resource.uptime >= 99.9 ? "text-success" : resource.uptime >= 99 ? "text-warning" : "text-destructive"
                    )}>
                      {resource.uptime}%
                    </p>
                  </div>
                </div>
              </div>

              {resource.cpu !== undefined && (
                <div className="glass-card p-4">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">CPU Usage</p>
                      <p className="font-medium text-foreground">{resource.cpu}%</p>
                      <Progress 
                        value={resource.cpu} 
                        className={cn(
                          "h-1.5 mt-1",
                          resource.cpu > 90 ? "[&>div]:bg-destructive" : resource.cpu > 70 ? "[&>div]:bg-warning" : "[&>div]:bg-success"
                        )} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {resource.memory !== undefined && (
                <div className="glass-card p-4">
                  <div className="flex items-center gap-3">
                    <MemoryStick className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Memory Usage</p>
                      <p className="font-medium text-foreground">{resource.memory}%</p>
                      <Progress 
                        value={resource.memory} 
                        className={cn(
                          "h-1.5 mt-1",
                          resource.memory > 90 ? "[&>div]:bg-destructive" : resource.memory > 70 ? "[&>div]:bg-warning" : "[&>div]:bg-success"
                        )} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resource Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Resource Information</h2>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Resource ID</span>
                    <span className="text-foreground font-mono text-sm max-w-[60%] truncate" title={resource.id}>
                      {resource.id}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Azure Type</span>
                    <span className="text-foreground">{resource.azureType}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Subscription</span>
                    <span className="text-foreground">{resource.subscription}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={resource.status} size="sm" />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags
                </h2>
                {resource.tags && Object.keys(resource.tags).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(resource.tags).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="py-1">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="ml-1 text-foreground">{value}</span>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No tags configured</p>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Metrics
              </h2>
              {metricsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : metrics && metrics.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {metrics.map((metric, index) => (
                    <div key={index} className="text-center p-4 rounded-lg bg-muted/30">
                      <p className="text-2xl font-bold text-foreground">
                        {typeof metric.value === 'number' ? metric.value.toFixed(2) : metric.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{metric.unit}</p>
                      <p className="text-sm text-foreground mt-1">{metric.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No metrics available for this resource type
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
