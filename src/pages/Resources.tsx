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
import { Search, Plus, Grid, List, Server, Loader2 } from "lucide-react";
import { useAzureMonitor } from "@/hooks/useAzureMonitor";

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const {
    subscriptions,
    selectedSubscription,
    setSelectedSubscription,
    resources,
    loading,
    error,
  } = useAzureMonitor();

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || resource.status === statusFilter;
    const matchesType = typeFilter === "all" || resource.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Resources</h1>
            <p className="text-muted-foreground">
              {loading ? "Loading..." : `${resources.length} resources from Azure`}
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
          </div>
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

        {/* Loading State */}
        {loading && (
          <div className="glass-card p-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading resources from Azure...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="glass-card p-12 text-center">
            <Server className="w-12 h-12 mx-auto text-destructive mb-4" />
            <p className="text-destructive font-medium">{error}</p>
            <p className="text-muted-foreground text-sm mt-2">
              Check your Azure connection settings
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && resources.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground font-medium">No Azure resources found</p>
            <p className="text-muted-foreground text-sm mt-2">
              {subscriptions.length === 0 
                ? "Connect your Azure account to view resources"
                : "Select a subscription to view its resources"}
            </p>
          </div>
        )}

        {/* Resources Grid */}
        {!loading && !error && resources.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredResources.map((resource) => (
              <ResourceCard 
                key={resource.id} 
                name={resource.name}
                type={resource.type}
                status={resource.status}
                region={resource.region}
                uptime={resource.uptime}
                cpu={resource.cpu}
                memory={resource.memory}
                subscription={resource.subscription}
              />
            ))}
          </div>
        )}

        {!loading && !error && resources.length > 0 && filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No resources found matching your criteria</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
