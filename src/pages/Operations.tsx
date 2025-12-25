import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  RefreshCw,
  Shield,
  Zap,
  Clock,
  Plus,
  Loader2,
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
import { useAzureMonitor } from "@/hooks/useAzureMonitor";

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

export default function Operations() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { resources, loading, error } = useAzureMonitor();

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
          {loading ? (
            <div className="glass-card p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="glass-card p-8 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Operations</h3>
              <p className="text-muted-foreground">
                No operations have been created yet. Click "New Operation" to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
