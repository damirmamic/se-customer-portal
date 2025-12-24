import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Globe, 
  Palette, 
  Shield, 
  Database,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Save
} from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account and application preferences</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Organization Settings
                </CardTitle>
                <CardDescription>Manage your organization details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input id="orgName" defaultValue="CloudOps Inc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgSlug">Organization URL</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                        cloudops.app/
                      </span>
                      <Input id="orgSlug" defaultValue="cloudops-inc" className="rounded-l-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                        <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                        <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                        <SelectItem value="cet">CET (Central European Time)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  Data & Privacy
                </CardTitle>
                <CardDescription>Control your data and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-foreground">Data Retention</p>
                    <p className="text-sm text-muted-foreground">Keep logs and analytics data for 90 days</p>
                  </div>
                  <Select defaultValue="90">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-foreground">Usage Analytics</p>
                    <p className="text-sm text-muted-foreground">Help improve the product with anonymous usage data</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive push notifications on mobile</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Critical Alerts Only</p>
                      <p className="text-sm text-muted-foreground">Only notify for critical incidents</p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Alert Types</CardTitle>
                <CardDescription>Configure which events trigger notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Incident Created", description: "When a new incident is reported", enabled: true },
                  { name: "Incident Resolved", description: "When an incident is marked resolved", enabled: true },
                  { name: "Resource Down", description: "When a resource becomes unavailable", enabled: true },
                  { name: "SLA Breach", description: "When SLA thresholds are exceeded", enabled: true },
                  { name: "Backup Failed", description: "When a backup job fails", enabled: true },
                  { name: "Security Alert", description: "When suspicious activity is detected", enabled: true },
                ].map((alert, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-foreground">{alert.name}</p>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                    <Switch defaultChecked={alert.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Theme
                </CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Color Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="cursor-pointer p-4 rounded-lg border-2 border-primary bg-muted/50 text-center">
                      <Moon className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <span className="text-sm font-medium text-foreground">Dark</span>
                    </div>
                    <div className="cursor-pointer p-4 rounded-lg border border-border hover:border-primary/50 bg-muted/30 text-center">
                      <Sun className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Light</span>
                    </div>
                    <div className="cursor-pointer p-4 rounded-lg border border-border hover:border-primary/50 bg-muted/30 text-center">
                      <SettingsIcon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">System</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-foreground">Compact Mode</p>
                    <p className="text-sm text-muted-foreground">Reduce spacing for more content</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-foreground">Animations</p>
                    <p className="text-sm text-muted-foreground">Enable UI animations and transitions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Settings */}
          <TabsContent value="integrations" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Connected Integrations
                </CardTitle>
                <CardDescription>Manage third-party integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Microsoft Entra ID", description: "SSO authentication", connected: true },
                  { name: "Slack", description: "Team notifications", connected: true },
                  { name: "PagerDuty", description: "On-call management", connected: false },
                  { name: "Jira", description: "Issue tracking", connected: false },
                  { name: "GitHub", description: "Source control", connected: true },
                ].map((integration, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-foreground">{integration.name}</p>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                    <Button variant={integration.connected ? "outline" : "default"} size="sm">
                      {integration.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
