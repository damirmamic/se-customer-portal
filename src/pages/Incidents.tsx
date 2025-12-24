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
  Plus,
  ArrowUpRight,
  Users,
  MessageSquare
} from "lucide-react";

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "investigating" | "identified" | "monitoring" | "resolved";
  affectedServices: string[];
  assignee: string;
  createdAt: string;
  updatedAt: string;
  comments: number;
}

const incidents: Incident[] = [
  {
    id: "INC-2024-089",
    title: "Database connection timeouts in US-East region",
    description: "Multiple services experiencing intermittent database connection failures",
    severity: "critical",
    status: "investigating",
    affectedServices: ["prod-api-cluster-01", "prod-db-primary"],
    assignee: "John Smith",
    createdAt: "2024-12-24T08:30:00Z",
    updatedAt: "2024-12-24T10:15:00Z",
    comments: 8,
  },
  {
    id: "INC-2024-088",
    title: "Elevated error rates on CDN edge nodes",
    description: "503 errors being returned from EU edge locations",
    severity: "high",
    status: "identified",
    affectedServices: ["cdn-global"],
    assignee: "Sarah Johnson",
    createdAt: "2024-12-24T07:45:00Z",
    updatedAt: "2024-12-24T09:30:00Z",
    comments: 5,
  },
  {
    id: "INC-2024-087",
    title: "Scheduled maintenance - Analytics cluster",
    description: "Planned maintenance window for analytics database upgrade",
    severity: "low",
    status: "monitoring",
    affectedServices: ["analytics-db"],
    assignee: "Mike Chen",
    createdAt: "2024-12-23T22:00:00Z",
    updatedAt: "2024-12-24T02:00:00Z",
    comments: 3,
  },
  {
    id: "INC-2024-086",
    title: "API rate limiting triggered for large customer",
    description: "Customer exceeded rate limits causing temporary service degradation",
    severity: "medium",
    status: "resolved",
    affectedServices: ["prod-api-cluster-01"],
    assignee: "Emily Davis",
    createdAt: "2024-12-23T14:20:00Z",
    updatedAt: "2024-12-23T15:45:00Z",
    comments: 12,
  },
];

const getSeverityBadge = (severity: Incident["severity"]) => {
  const styles = {
    critical: "bg-destructive/20 text-destructive border-destructive/30",
    high: "bg-warning/20 text-warning border-warning/30",
    medium: "bg-info/20 text-info border-info/30",
    low: "bg-muted text-muted-foreground",
  };
  return <Badge className={styles[severity]}>{severity}</Badge>;
};

const getStatusBadge = (status: Incident["status"]) => {
  const styles = {
    open: { icon: AlertCircle, className: "text-destructive" },
    investigating: { icon: AlertTriangle, className: "text-warning" },
    identified: { icon: Clock, className: "text-info" },
    monitoring: { icon: Clock, className: "text-primary" },
    resolved: { icon: CheckCircle2, className: "text-success" },
  };
  const { icon: Icon, className } = styles[status];
  return (
    <Badge variant="outline" className={className}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </Badge>
  );
};

const Incidents = () => {
  const openIncidents = incidents.filter((i) => i.status !== "resolved").length;
  const criticalIncidents = incidents.filter((i) => i.severity === "critical" && i.status !== "resolved").length;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Incidents</h1>
            <p className="text-muted-foreground">Monitor and manage active incidents</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Incident
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Incidents</p>
                  <p className="text-2xl font-bold text-foreground">{openIncidents}</p>
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
                  <p className="text-2xl font-bold text-destructive">{criticalIncidents}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
                  <p className="text-2xl font-bold text-foreground">2.4h</p>
                </div>
                <Clock className="w-8 h-8 text-info" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
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
                <Input placeholder="Search incidents..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="identified">Identified</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Incidents List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>All Incidents</CardTitle>
            <CardDescription>Showing {incidents.length} incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-muted-foreground">{incident.id}</span>
                        {getSeverityBadge(incident.severity)}
                        {getStatusBadge(incident.status)}
                      </div>
                      <h3 className="font-medium text-foreground mb-1">{incident.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{incident.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {incident.assignee}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {incident.comments} comments
                        </span>
                        <span>
                          Updated {new Date(incident.updatedAt).toLocaleString()}
                        </span>
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
      </div>
    </MainLayout>
  );
};

export default Incidents;
