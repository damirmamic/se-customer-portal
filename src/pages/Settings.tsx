import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
  Save,
  Loader2
} from "lucide-react";
import { useSettings, UserSettingsUpdate } from "@/hooks/useSettings";

const Settings = () => {
  const { 
    userSettings, 
    orgSettings, 
    isLoading, 
    updateUserSettings, 
    updateOrgSettings,
    isSaving 
  } = useSettings();

  // Local state for form values
  const [localSettings, setLocalSettings] = useState<UserSettingsUpdate>({});
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");

  // Sync local state with fetched data
  useEffect(() => {
    if (userSettings) {
      setLocalSettings({
        email_notifications: userSettings.email_notifications,
        push_notifications: userSettings.push_notifications,
        critical_alerts_only: userSettings.critical_alerts_only,
        theme: userSettings.theme,
        compact_mode: userSettings.compact_mode,
        animations_enabled: userSettings.animations_enabled,
        timezone: userSettings.timezone,
        language: userSettings.language,
        alert_incident_created: userSettings.alert_incident_created,
        alert_incident_resolved: userSettings.alert_incident_resolved,
        alert_resource_down: userSettings.alert_resource_down,
        alert_sla_breach: userSettings.alert_sla_breach,
        alert_backup_failed: userSettings.alert_backup_failed,
        alert_security: userSettings.alert_security,
        data_retention_days: userSettings.data_retention_days,
        usage_analytics: userSettings.usage_analytics,
      });
    }
  }, [userSettings]);

  useEffect(() => {
    if (orgSettings) {
      setOrgName(orgSettings.org_name);
      setOrgSlug(orgSettings.org_slug || "");
    }
  }, [orgSettings]);

  const handleSave = () => {
    updateUserSettings(localSettings);
    if (orgName || orgSlug) {
      updateOrgSettings({ org_name: orgName, org_slug: orgSlug || null });
    }
  };

  const updateSetting = <K extends keyof UserSettingsUpdate>(key: K, value: UserSettingsUpdate[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account and application preferences</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
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
                    <Input 
                      id="orgName" 
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="My Organization"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgSlug">Organization URL</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                        cloudops.app/
                      </span>
                      <Input 
                        id="orgSlug" 
                        value={orgSlug}
                        onChange={(e) => setOrgSlug(e.target.value)}
                        className="rounded-l-none" 
                        placeholder="my-org"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={localSettings.timezone || "UTC"} 
                      onValueChange={(value) => updateSetting("timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                        <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                        <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                        <SelectItem value="CET">CET (Central European Time)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={localSettings.language || "en"} 
                      onValueChange={(value) => updateSetting("language", value)}
                    >
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
                    <p className="text-sm text-muted-foreground">Keep logs and analytics data</p>
                  </div>
                  <Select 
                    value={String(localSettings.data_retention_days || 90)} 
                    onValueChange={(value) => updateSetting("data_retention_days", parseInt(value))}
                  >
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
                  <Switch 
                    checked={localSettings.usage_analytics ?? true}
                    onCheckedChange={(checked) => updateSetting("usage_analytics", checked)}
                  />
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
                  <Switch 
                    checked={localSettings.email_notifications ?? true}
                    onCheckedChange={(checked) => updateSetting("email_notifications", checked)}
                  />
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
                  <Switch 
                    checked={localSettings.push_notifications ?? true}
                    onCheckedChange={(checked) => updateSetting("push_notifications", checked)}
                  />
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
                  <Switch 
                    checked={localSettings.critical_alerts_only ?? false}
                    onCheckedChange={(checked) => updateSetting("critical_alerts_only", checked)}
                  />
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
                  { key: "alert_incident_created" as const, name: "Incident Created", description: "When a new incident is reported" },
                  { key: "alert_incident_resolved" as const, name: "Incident Resolved", description: "When an incident is marked resolved" },
                  { key: "alert_resource_down" as const, name: "Resource Down", description: "When a resource becomes unavailable" },
                  { key: "alert_sla_breach" as const, name: "SLA Breach", description: "When SLA thresholds are exceeded" },
                  { key: "alert_backup_failed" as const, name: "Backup Failed", description: "When a backup job fails" },
                  { key: "alert_security" as const, name: "Security Alert", description: "When suspicious activity is detected" },
                ].map((alert) => (
                  <div key={alert.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-foreground">{alert.name}</p>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                    <Switch 
                      checked={localSettings[alert.key] ?? true}
                      onCheckedChange={(checked) => updateSetting(alert.key, checked)}
                    />
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
                    <div 
                      className={`cursor-pointer p-4 rounded-lg border-2 ${localSettings.theme === "dark" ? "border-primary bg-muted/50" : "border-border hover:border-primary/50 bg-muted/30"} text-center`}
                      onClick={() => updateSetting("theme", "dark")}
                    >
                      <Moon className={`w-6 h-6 mx-auto mb-2 ${localSettings.theme === "dark" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-sm font-medium text-foreground">Dark</span>
                    </div>
                    <div 
                      className={`cursor-pointer p-4 rounded-lg border-2 ${localSettings.theme === "light" ? "border-primary bg-muted/50" : "border-border hover:border-primary/50 bg-muted/30"} text-center`}
                      onClick={() => updateSetting("theme", "light")}
                    >
                      <Sun className={`w-6 h-6 mx-auto mb-2 ${localSettings.theme === "light" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-sm font-medium text-foreground">Light</span>
                    </div>
                    <div 
                      className={`cursor-pointer p-4 rounded-lg border-2 ${localSettings.theme === "system" ? "border-primary bg-muted/50" : "border-border hover:border-primary/50 bg-muted/30"} text-center`}
                      onClick={() => updateSetting("theme", "system")}
                    >
                      <SettingsIcon className={`w-6 h-6 mx-auto mb-2 ${localSettings.theme === "system" ? "text-primary" : "text-muted-foreground"}`} />
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
                  <Switch 
                    checked={localSettings.compact_mode ?? false}
                    onCheckedChange={(checked) => updateSetting("compact_mode", checked)}
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-foreground">Animations</p>
                    <p className="text-sm text-muted-foreground">Enable UI animations and transitions</p>
                  </div>
                  <Switch 
                    checked={localSettings.animations_enabled ?? true}
                    onCheckedChange={(checked) => updateSetting("animations_enabled", checked)}
                  />
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
