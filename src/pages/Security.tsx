import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCcw,
  ShieldCheck,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { useAzureMonitor } from "@/hooks/useAzureMonitor";

const securitySettings = [
  { name: "Two-Factor Authentication", description: "Require MFA for all users", enabled: true },
  { name: "Session Timeout", description: "Auto-logout after 30 minutes of inactivity", enabled: true },
  { name: "Login Notifications", description: "Email alerts for new device logins", enabled: true },
  { name: "IP Restriction", description: "Limit access to approved IP ranges", enabled: false },
  { name: "Audit Logging", description: "Log all user actions for compliance", enabled: true },
  { name: "API Rate Limiting", description: "Prevent abuse with request limits", enabled: true },
];

const Security = () => {
  const { alerts, loading, error } = useAzureMonitor();

  // Filter security-related incidents
  const securityAlerts = alerts.filter(a => 
    a.name?.toLowerCase().includes('security') || 
    a.severity === 'Sev0' || 
    a.severity === 'Sev1'
  );

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Security</h1>
            <p className="text-muted-foreground">Monitor and manage security settings</p>
          </div>
          <Button>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Run Security Scan
          </Button>
        </div>

        {/* Security Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Security Status</p>
                  <p className="text-2xl font-bold text-success">Protected</p>
                </div>
                <ShieldCheck className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "—" : securityAlerts.length}
                  </p>
                </div>
                <ShieldAlert className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Settings Active</p>
                  <p className="text-2xl font-bold text-foreground">
                    {securitySettings.filter(s => s.enabled).length}/{securitySettings.length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Alerts */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>Active security-related incidents from Azure</CardDescription>
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
              ) : securityAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-success mb-3" />
                  <p className="text-muted-foreground">No security alerts</p>
                </div>
              ) : (
              <div className="space-y-3">
                  {securityAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-warning" />
                        <div>
                          <p className="font-medium text-foreground">{alert.name}</p>
                          <p className="text-sm text-muted-foreground">{alert.severity}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-warning border-warning/30"
                      >
                        {alert.state}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securitySettings.map((setting, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">{setting.name}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch defaultChecked={setting.enabled} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Security;
