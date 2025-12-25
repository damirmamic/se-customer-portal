import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  HardDrive, 
  Upload, 
  Folder, 
  FileText,
  Plus,
  Search,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAzureMonitor } from "@/hooks/useAzureMonitor";

const Storage = () => {
  const { resources, loading, error } = useAzureMonitor();

  // Filter for storage resources
  const storageResources = resources.filter(r => 
    r.type === 'storage' || 
    r.azureType?.toLowerCase().includes('storage')
  );

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Storage</h1>
            <p className="text-muted-foreground">Manage your Azure storage accounts</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Storage Account
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Storage Accounts</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "—" : storageResources.length}
                  </p>
                </div>
                <HardDrive className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Containers</p>
                  <p className="text-2xl font-bold text-foreground">—</p>
                </div>
                <Folder className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Files</p>
                  <p className="text-2xl font-bold text-foreground">—</p>
                </div>
                <FileText className="w-8 h-8 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="glass-card">
          <CardContent className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search storage accounts..." className="pl-10" />
            </div>
          </CardContent>
        </Card>

        {/* Storage Accounts */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Storage Accounts</CardTitle>
            <CardDescription>Azure storage accounts in your subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">{error}</p>
              </div>
            ) : storageResources.length === 0 ? (
              <div className="text-center py-8">
                <HardDrive className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No storage accounts found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a storage account in Azure Portal to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {storageResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Folder className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground">{resource.name}</h3>
                            <Badge variant="outline">{resource.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {resource.region}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Storage;
