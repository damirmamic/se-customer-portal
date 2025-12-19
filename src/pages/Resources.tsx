import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ResourceCard } from "@/components/dashboard/ResourceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Grid, List, Filter } from "lucide-react";

const allResources = [
  { name: "prod-api-cluster-01", type: "container" as const, status: "healthy" as const, region: "US East", uptime: 99.99, cpu: 45, memory: 62, subscription: "Enterprise Production" },
  { name: "prod-db-primary", type: "database" as const, status: "healthy" as const, region: "US East", uptime: 99.98, cpu: 38, memory: 71, subscription: "Enterprise Production" },
  { name: "prod-db-replica", type: "database" as const, status: "healthy" as const, region: "US West", uptime: 99.99, cpu: 22, memory: 55, subscription: "Enterprise Production" },
  { name: "staging-vm-01", type: "vm" as const, status: "healthy" as const, region: "EU West", uptime: 99.92, cpu: 56, memory: 68, subscription: "Development" },
  { name: "staging-vm-02", type: "vm" as const, status: "warning" as const, region: "EU West", uptime: 99.85, cpu: 89, memory: 82, subscription: "Development" },
  { name: "cdn-global", type: "cdn" as const, status: "degraded" as const, region: "Global", uptime: 99.92, subscription: "Enterprise Production" },
  { name: "backup-storage-01", type: "storage" as const, status: "healthy" as const, region: "US West", uptime: 100, subscription: "Enterprise Backup" },
  { name: "backup-storage-02", type: "storage" as const, status: "healthy" as const, region: "EU Central", uptime: 100, subscription: "Enterprise Backup" },
  { name: "analytics-db", type: "database" as const, status: "maintenance" as const, region: "US Central", uptime: 99.95, cpu: 12, memory: 45, subscription: "Analytics" },
  { name: "ml-cluster-01", type: "container" as const, status: "healthy" as const, region: "US East", uptime: 99.97, cpu: 78, memory: 85, subscription: "Analytics" },
  { name: "cache-redis-01", type: "database" as const, status: "healthy" as const, region: "US East", uptime: 99.99, cpu: 25, memory: 48, subscription: "Enterprise Production" },
  { name: "queue-rabbitmq", type: "container" as const, status: "healthy" as const, region: "US East", uptime: 99.98, cpu: 32, memory: 41, subscription: "Enterprise Production" },
];

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredResources = allResources.filter((resource) => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || resource.status === statusFilter;
    const matchesType = typeFilter === "all" || resource.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Resources</h1>
            <p className="text-muted-foreground">
              {allResources.length} resources across all subscriptions
            </p>
          </div>
          <Button variant="glow">
            <Plus className="w-4 h-4 mr-2" />
            Create Resource
          </Button>
        </div>

        {/* Filters */}
        <div className="glass-card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                className="pl-10 bg-muted/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vm">Virtual Machine</SelectItem>
                <SelectItem value="database">Database</SelectItem>
                <SelectItem value="storage">Storage</SelectItem>
                <SelectItem value="cdn">CDN</SelectItem>
                <SelectItem value="container">Container</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 border border-border rounded-md p-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-muted">
                <Grid className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.name} {...resource} />
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No resources found matching your criteria</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
