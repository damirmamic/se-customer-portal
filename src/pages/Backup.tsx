import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  Clock, 
  CheckCircle2, 
  RotateCcw,
  Shield,
  HardDrive,
  Play,
  Loader2
} from "lucide-react";
import { useAzureMonitor } from "@/hooks/useAzureMonitor";

const Backup = () => {
  const { resources, loading, error } = useAzureMonitor();

  // Filter for storage/backup related resources
  const backupResources = resources.filter(r => 
    r.type === 'storage' || 
    r.azureType?.toLowerCase().includes('backup') ||
    r.azureType?.toLowerCase().includes('recovery')
  );

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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Backup Resources</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "—" : backupResources.length}
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
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold text-foreground">—</p>
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
                  <p className="text-2xl font-bold text-foreground">—</p>
                </div>
                <Shield className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last Backup</p>
                  <p className="text-2xl font-bold text-foreground">—</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Backup Resources */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Backup Resources</CardTitle>
            <CardDescription>Azure backup and recovery services</CardDescription>
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
            ) : backupResources.length === 0 ? (
              <div className="text-center py-8">
                <Database className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No backup resources found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure Azure Backup or Recovery Services in Azure Portal
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {backupResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Database className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{resource.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {resource.region} • {resource.azureType}
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

        {/* Info Card */}
        <Card className="glass-card">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Azure Backup Integration</p>
                <p className="text-sm text-muted-foreground">
                  For detailed backup management and recovery operations, visit the Azure Portal Recovery Services section.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Backup;
