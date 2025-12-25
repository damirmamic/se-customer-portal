import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Download, 
  Calendar,
  TrendingUp,
  Server,
  Database,
  HardDrive,
  Loader2
} from "lucide-react";
import { useAzureMonitor } from "@/hooks/useAzureMonitor";

const Billing = () => {
  const { subscriptions, loading, error } = useAzureMonitor();

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing</h1>
            <p className="text-muted-foreground">Manage your subscription and payment methods</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "—" : subscriptions.length}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Resources</p>
                  <p className="text-2xl font-bold text-foreground">—</p>
                </div>
                <Server className="w-8 h-8 text-info" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-foreground">—</p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Azure Subscriptions</CardTitle>
            <CardDescription>Your active Azure subscriptions</CardDescription>
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
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No subscriptions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.subscriptionId}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Database className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{sub.displayName}</p>
                        <p className="text-sm text-muted-foreground font-mono">{sub.subscriptionId}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={sub.state === "Enabled" ? "text-success border-success/30" : ""}
                    >
                      {sub.state}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Note about billing */}
        <Card className="glass-card">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Azure Cost Management</p>
                <p className="text-sm text-muted-foreground">
                  For detailed billing and cost analysis, visit the Azure Portal Cost Management section.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Billing;
