import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  Key,
  Globe,
  Users,
  FileWarning,
  RefreshCcw,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";

const securityScore = 87;

const securityChecks = [
  { name: "SSL/TLS Encryption", status: "passed", description: "All traffic encrypted with TLS 1.3" },
  { name: "Firewall Rules", status: "passed", description: "12 rules active, last reviewed 2 days ago" },
  { name: "Access Logging", status: "passed", description: "Comprehensive logging enabled" },
  { name: "MFA Enforcement", status: "warning", description: "3 users without MFA enabled" },
  { name: "Password Policy", status: "passed", description: "Strong password requirements enforced" },
  { name: "IP Allowlisting", status: "passed", description: "Restricted to corporate IPs" },
  { name: "Vulnerability Scan", status: "warning", description: "2 medium vulnerabilities detected" },
  { name: "Data Encryption", status: "passed", description: "AES-256 encryption at rest" },
];

const recentEvents = [
  { event: "Failed login attempt", user: "unknown@external.com", ip: "185.234.72.19", time: "5 min ago", severity: "warning" },
  { event: "API key regenerated", user: "john.smith@company.com", ip: "10.0.1.45", time: "1 hour ago", severity: "info" },
  { event: "Role updated", user: "admin@company.com", ip: "10.0.1.12", time: "2 hours ago", severity: "info" },
  { event: "Suspicious activity blocked", user: "bot-traffic", ip: "45.33.32.156", time: "3 hours ago", severity: "critical" },
  { event: "Successful login", user: "sarah@company.com", ip: "10.0.1.78", time: "4 hours ago", severity: "success" },
];

const securitySettings = [
  { name: "Two-Factor Authentication", description: "Require MFA for all users", enabled: true },
  { name: "Session Timeout", description: "Auto-logout after 30 minutes of inactivity", enabled: true },
  { name: "Login Notifications", description: "Email alerts for new device logins", enabled: true },
  { name: "IP Restriction", description: "Limit access to approved IP ranges", enabled: false },
  { name: "Audit Logging", description: "Log all user actions for compliance", enabled: true },
  { name: "API Rate Limiting", description: "Prevent abuse with request limits", enabled: true },
];

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "critical":
      return <ShieldAlert className="w-4 h-4 text-destructive" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-warning" />;
    case "success":
      return <CheckCircle2 className="w-4 h-4 text-success" />;
    default:
      return <Eye className="w-4 h-4 text-info" />;
  }
};

const Security = () => {
  const passedChecks = securityChecks.filter((c) => c.status === "passed").length;

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

        {/* Security Score */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card md:col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      className="stroke-muted"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      className="stroke-primary"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(securityScore / 100) * 352} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">{securityScore}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Security Score</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Your infrastructure security rating
                  </p>
                  <Badge className="bg-success/20 text-success border-success/30">Good</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Checks Passed</p>
                  <p className="text-2xl font-bold text-foreground">{passedChecks}/{securityChecks.length}</p>
                </div>
                <ShieldCheck className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Threats Blocked</p>
                  <p className="text-2xl font-bold text-foreground">1,247</p>
                </div>
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Checks */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Security Checks</CardTitle>
              <CardDescription>Automated security compliance checks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityChecks.map((check, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      {check.status === "passed" ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-warning" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{check.name}</p>
                        <p className="text-sm text-muted-foreground">{check.description}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={check.status === "passed" ? "text-success border-success/30" : "text-warning border-warning/30"}
                    >
                      {check.status}
                    </Badge>
                  </div>
                ))}
              </div>
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

        {/* Recent Security Events */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
            <CardDescription>Latest security-related activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getSeverityIcon(event.severity)}
                    <div>
                      <p className="font-medium text-foreground">{event.event}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.user} • IP: {event.ip}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{event.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Security;
