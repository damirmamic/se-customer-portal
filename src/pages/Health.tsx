import { MainLayout } from "@/components/layout/MainLayout";
import { SLAChart } from "@/components/dashboard/SLAChart";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Activity, Clock, TrendingUp, AlertTriangle } from "lucide-react";

const services = [
  { name: "API Gateway", status: "healthy" as const, uptime: 99.99, latency: 45, errorRate: 0.01 },
  { name: "Authentication Service", status: "healthy" as const, uptime: 99.98, latency: 32, errorRate: 0.02 },
  { name: "Database Cluster", status: "healthy" as const, uptime: 99.97, latency: 12, errorRate: 0.005 },
  { name: "CDN", status: "degraded" as const, uptime: 99.85, latency: 120, errorRate: 0.5 },
  { name: "Storage Service", status: "healthy" as const, uptime: 100, latency: 28, errorRate: 0 },
  { name: "Message Queue", status: "healthy" as const, uptime: 99.99, latency: 8, errorRate: 0.01 },
  { name: "Analytics Pipeline", status: "maintenance" as const, uptime: 99.92, latency: 250, errorRate: 0.1 },
  { name: "ML Inference", status: "healthy" as const, uptime: 99.95, latency: 180, errorRate: 0.08 },
];

const slaTargets = [
  { name: "Availability", target: 99.95, current: 99.97, unit: "%" },
  { name: "Response Time", target: 200, current: 142, unit: "ms" },
  { name: "Error Rate", target: 0.1, current: 0.05, unit: "%" },
  { name: "Throughput", target: 10000, current: 12500, unit: "req/s" },
];

export default function Health() {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Health & SLA</h1>
          <p className="text-muted-foreground">
            Monitor service health and SLA compliance metrics
          </p>
        </div>

        {/* SLA Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {slaTargets.map((sla) => {
            const isGood = sla.name === "Response Time" || sla.name === "Error Rate"
              ? sla.current <= sla.target
              : sla.current >= sla.target;
            
            return (
              <div key={sla.name} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{sla.name}</span>
                  {isGood ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={cn(
                    "text-2xl font-bold",
                    isGood ? "text-success" : "text-warning"
                  )}>
                    {sla.current}
                  </span>
                  <span className="text-sm text-muted-foreground">{sla.unit}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Target: {sla.target}{sla.unit}
                </p>
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <SLAChart />

        {/* Services Health */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-foreground mb-4">Service Health</h2>
          
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.name}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-foreground">{service.name}</h3>
                    <StatusBadge status={service.status} size="sm" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Uptime:</span>
                      <span className={cn(
                        "font-medium",
                        service.uptime >= 99.9 ? "text-success" : "text-warning"
                      )}>
                        {service.uptime}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Latency:</span>
                      <span className={cn(
                        "font-medium",
                        service.latency <= 100 ? "text-success" : service.latency <= 200 ? "text-warning" : "text-destructive"
                      )}>
                        {service.latency}ms
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Error Rate:</span>
                      <span className={cn(
                        "font-medium",
                        service.errorRate <= 0.1 ? "text-success" : "text-warning"
                      )}>
                        {service.errorRate}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-32">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Health</span>
                    <span>{Math.round((service.uptime / 100) * 100)}%</span>
                  </div>
                  <Progress 
                    value={service.uptime} 
                    className={cn(
                      "h-2",
                      service.uptime >= 99.9 ? "[&>div]:bg-success" : "[&>div]:bg-warning"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
