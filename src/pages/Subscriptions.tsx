import { MainLayout } from "@/components/layout/MainLayout";
import { CreditCard, Users, Server, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAzureMonitor } from "@/hooks/useAzureMonitor";

const planColors = {
  Enterprise: "bg-primary/20 text-primary border-primary/30",
  Professional: "bg-info/20 text-info border-info/30",
  Starter: "bg-muted text-muted-foreground border-border",
};

export default function Subscriptions() {
  const { subscriptions, loading, error } = useAzureMonitor();

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
            <p className="text-muted-foreground">
              Manage your Azure subscriptions
            </p>
          </div>
          <Button variant="glow">
            <CreditCard className="w-4 h-4 mr-2" />
            Add Subscription
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="glass-card p-6 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Subscriptions Found</h3>
            <p className="text-muted-foreground">
              Connect your Azure account to view subscriptions
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {subscriptions.map((sub) => (
              <div key={sub.subscriptionId} className="glass-card p-6 hover:border-primary/30 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-foreground">{sub.displayName}</h3>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          sub.state === "Enabled" 
                            ? "bg-success/20 text-success border-success/30"
                            : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {sub.state}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{sub.subscriptionId}</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <Server className="w-5 h-5 mx-auto text-primary mb-1" />
                    <p className="text-lg font-semibold">—</p>
                    <p className="text-xs text-muted-foreground">Resources</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <Users className="w-5 h-5 mx-auto text-info mb-1" />
                    <p className="text-lg font-semibold">—</p>
                    <p className="text-xs text-muted-foreground">Users</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
