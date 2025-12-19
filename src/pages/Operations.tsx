import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Database,
  RefreshCw,
  Shield,
  Zap,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Operation {
  id: string;
  name: string;
  type: "backup" | "restore" | "failover" | "scale" | "maintenance";
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress?: number;
  startedAt: string;
  duration?: string;
  resource: string;
  initiatedBy: string;
}

const operations: Operation[] = [
  {
    id: "OP-2024-001",
    name: "Full Database Backup",
    type: "backup",
    status: "running",
    progress: 67,
    startedAt: "10 min ago",
    duration: "~5 min remaining",
    resource: "prod-db-primary",
    initiatedBy: "Scheduled",
  },
  {
    id: "OP-2024-002",
    name: "Disaster Recovery Failover Test",
    type: "failover",
    status: "completed",
    startedAt: "2 hours ago",
    duration: "12 min",
    resource: "Region US-East → US-West",
    initiatedBy: "admin@company.com",
  },
  {
    id: "OP-2024-003",
    name: "Horizontal Scale Out",
    type: "scale",
    status: "pending",
    startedAt: "Scheduled: 15:00 UTC",
    resource: "prod-api-cluster-01",
    initiatedBy: "Auto-scaling Policy",
  },
  {
    id: "OP-2024-004",
    name: "Point-in-Time Restore",
    type: "restore",
    status: "failed",
    startedAt: "1 hour ago",
    duration: "8 min",
    resource: "staging-db",
    initiatedBy: "john@company.com",
  },
  {
    id: "OP-2024-005",
    name: "Maintenance Window - Patching",
    type: "maintenance",
    status: "running",
    progress: 34,
    startedAt: "25 min ago",
    duration: "~45 min remaining",
    resource: "analytics-db",
    initiatedBy: "Scheduled",
  },
  {
    id: "OP-2024-006",
    name: "Incremental Backup",
    type: "backup",
    status: "completed",
    startedAt: "3 hours ago",
    duration: "4 min",
    resource: "prod-db-replica",
    initiatedBy: "Scheduled",
  },
];

const typeIcons = {
  backup: Database,
  restore: RefreshCw,
  failover: Shield,
  scale: Zap,
  maintenance: Clock,
};

const typeLabels = {
  backup: "Backup",
  restore: "Restore",
  failover: "Failover",
  scale: "Scale",
  maintenance: "Maintenance",
};

const statusConfig = {
  pending: { icon: Clock, className: "text-muted-foreground bg-muted", label: "Pending" },
  running: { icon: RefreshCw, className: "text-info bg-info/20", label: "Running" },
  completed: { icon: CheckCircle2, className: "text-success bg-success/20", label: "Completed" },
  failed: { icon: XCircle, className: "text-destructive bg-destructive/20", label: "Failed" },
  cancelled: { icon: AlertCircle, className: "text-muted-foreground bg-muted", label: "Cancelled" },
};

export default function Operations() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOps = operations.filter((op) => {
    const matchesType = typeFilter === "all" || op.type === typeFilter;
    const matchesStatus = statusFilter === "all" || op.status === statusFilter;
    return matchesType && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Operations</h1>
            <p className="text-muted-foreground">
              Manage backup, restore, DR, and SRE operations
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="glow">
                <Plus className="w-4 h-4 mr-2" />
                New Operation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Operation</DialogTitle>
                <DialogDescription>
                  Select an operation type to initiate
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                {Object.entries(typeLabels).map(([key, label]) => {
                  const Icon = typeIcons[key as keyof typeof typeIcons];
                  return (
                    <Button
                      key={key}
                      variant="outline"
                      className="h-24 flex-col gap-2 hover:border-primary/50"
                    >
                      <Icon className="w-6 h-6 text-primary" />
                      <span>{label}</span>
                    </Button>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="backup">Backup</SelectItem>
                <SelectItem value="restore">Restore</SelectItem>
                <SelectItem value="failover">Failover</SelectItem>
                <SelectItem value="scale">Scale</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Operations List */}
        <div className="space-y-4">
          {filteredOps.map((op) => {
            const TypeIcon = typeIcons[op.type];
            const StatusConfig = statusConfig[op.status];
            const StatusIcon = StatusConfig.icon;

            return (
              <div
                key={op.id}
                className="glass-card p-4 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <TypeIcon className="w-6 h-6 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className="text-sm font-mono text-muted-foreground">
                        {op.id}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[op.type]}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", StatusConfig.className)}
                      >
                        <StatusIcon
                          className={cn(
                            "w-3 h-3 mr-1",
                            op.status === "running" && "animate-spin"
                          )}
                        />
                        {StatusConfig.label}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-foreground mb-1">
                      {op.name}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>Resource: {op.resource}</span>
                      <span>•</span>
                      <span>{op.startedAt}</span>
                      {op.duration && (
                        <>
                          <span>•</span>
                          <span>{op.duration}</span>
                        </>
                      )}
                    </div>

                    {op.progress !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground">{op.progress}%</span>
                        </div>
                        <Progress value={op.progress} className="h-2" />
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                      Initiated by: {op.initiatedBy}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {op.status === "running" && (
                      <Button variant="ghost" size="icon">
                        <Pause className="w-4 h-4" />
                      </Button>
                    )}
                    {op.status === "pending" && (
                      <Button variant="ghost" size="icon">
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                    {op.status === "failed" && (
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
