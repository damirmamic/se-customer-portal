import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  RotateCcw,
  Shield,
  HardDrive,
  Calendar,
  Play
} from "lucide-react";

interface BackupJob {
  id: string;
  name: string;
  type: "full" | "incremental" | "differential";
  source: string;
  status: "completed" | "running" | "scheduled" | "failed";
  lastRun: string;
  nextRun: string;
  size: string;
  duration: string;
  retention: string;
}

const backupJobs: BackupJob[] = [
  {
    id: "1",
    name: "Production Database - Daily",
    type: "full",
    source: "prod-db-primary",
    status: "completed",
    lastRun: "2024-12-24T02:00:00Z",
    nextRun: "2024-12-25T02:00:00Z",
    size: "245 GB",
    duration: "45 min",
    retention: "30 days",
  },
  {
    id: "2",
    name: "API Cluster Configs",
    type: "incremental",
    source: "prod-api-cluster-01",
    status: "running",
    lastRun: "2024-12-24T06:00:00Z",
    nextRun: "2024-12-24T12:00:00Z",
    size: "12 GB",
    duration: "8 min",
    retention: "14 days",
  },
  {
    id: "3",
    name: "Analytics Database - Weekly",
    type: "full",
    source: "analytics-db",
    status: "scheduled",
    lastRun: "2024-12-22T03:00:00Z",
    nextRun: "2024-12-29T03:00:00Z",
    size: "890 GB",
    duration: "2.5 hrs",
    retention: "90 days",
  },
  {
    id: "4",
    name: "User Files Backup",
    type: "differential",
    source: "backup-storage-01",
    status: "failed",
    lastRun: "2024-12-23T04:00:00Z",
    nextRun: "2024-12-24T04:00:00Z",
    size: "1.2 TB",
    duration: "N/A",
    retention: "60 days",
  },
];

const recoveryPoints = [
  { date: "2024-12-24 02:00", type: "Full", size: "245 GB", status: "verified" },
  { date: "2024-12-23 02:00", type: "Full", size: "244 GB", status: "verified" },
  { date: "2024-12-22 02:00", type: "Full", size: "243 GB", status: "verified" },
  { date: "2024-12-21 02:00", type: "Full", size: "242 GB", status: "verified" },
  { date: "2024-12-20 02:00", type: "Full", size: "240 GB", status: "verified" },
];

const getStatusBadge = (status: BackupJob["status"]) => {
  const styles = {
    completed: { icon: CheckCircle2, className: "text-success border-success/30" },
    running: { icon: Clock, className: "text-primary border-primary/30 animate-pulse" },
    scheduled: { icon: Calendar, className: "text-info border-info/30" },
    failed: { icon: AlertTriangle, className: "text-destructive border-destructive/30" },
  };
  const { icon: Icon, className } = styles[status];
  return (
    <Badge variant="outline" className={className}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </Badge>
  );
};

const Backup = () => {
  const totalStorage = 2.4; // TB
  const usedStorage = 1.8; // TB
  const storagePercentage = (usedStorage / totalStorage) * 100;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Backup & Disaster Recovery</h1>
            <p className="text-muted-foreground">Manage backups and recovery points</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore
            </Button>
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Run Backup Now
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Backup Storage</p>
                  <p className="text-2xl font-bold text-foreground">{usedStorage} TB</p>
                </div>
                <HardDrive className="w-8 h-8 text-primary" />
              </div>
              <Progress value={storagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">of {totalStorage} TB used</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold text-foreground">4</p>
                </div>
                <Database className="w-8 h-8 text-info" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recovery Points</p>
                  <p className="text-2xl font-bold text-foreground">127</p>
                </div>
                <Shield className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last Successful</p>
                  <p className="text-2xl font-bold text-foreground">2h ago</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Backup Jobs */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Backup Jobs</CardTitle>
            <CardDescription>Scheduled and running backup tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {backupJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Database className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{job.name}</h3>
                          {getStatusBadge(job.status)}
                          <Badge variant="outline">{job.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Source: {job.source} • Size: {job.size} • Duration: {job.duration}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">
                        Last: {new Date(job.lastRun).toLocaleString()}
                      </p>
                      <p className="text-muted-foreground">
                        Next: {new Date(job.nextRun).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recovery Points */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Recovery Points</CardTitle>
            <CardDescription>Production Database - prod-db-primary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recoveryPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium text-foreground">{point.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {point.type} backup • {point.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-success border-success/30">
                      {point.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Restore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Backup;
