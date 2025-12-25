import { useState } from "react";
import { Bell, Search, User, HelpCircle, LogOut, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useAzureMonitor } from "@/hooks/useAzureMonitor";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Header() {
  const { user, roles, signOut } = useAuth();
  const { alerts } = useAzureMonitor();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  const displayEmail = user?.email || '';
  const primaryRole = roles[0] || 'customer';

  const activeAlerts = alerts.filter(a => a.state === 'New' || a.state === 'Acknowledged');
  const notificationCount = activeAlerts.length;

  const getSeverityIcon = (severity: string) => {
    if (severity === 'Sev0' || severity === 'Sev1') {
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
    if (severity === 'Sev2') {
      return <AlertTriangle className="w-4 h-4 text-warning" />;
    }
    return <Info className="w-4 h-4 text-info" />;
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search resources, subscriptions, operations..."
              className="pl-10 bg-muted/50 border-border/50 focus:border-primary/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {notificationCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {notificationCount} active
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[300px]">
                {activeAlerts.length === 0 ? (
                  <div className="p-4 text-center">
                    <CheckCircle className="w-8 h-8 mx-auto text-success mb-2" />
                    <p className="text-sm text-muted-foreground">All clear! No active alerts.</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-1">
                    {activeAlerts.slice(0, 10).map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigate('/incidents');
                        }}
                      >
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {alert.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {alert.resource}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(alert.firedAt)}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs shrink-0",
                            (alert.severity === 'Sev0' || alert.severity === 'Sev1') && "border-destructive text-destructive",
                            alert.severity === 'Sev2' && "border-warning text-warning"
                          )}
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {activeAlerts.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-center justify-center text-primary cursor-pointer"
                    onClick={() => navigate('/incidents')}
                  >
                    View all incidents
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon">
            <HelpCircle className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{displayName}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {displayEmail}
                  </span>
                  <Badge variant="outline" className="mt-1 w-fit text-xs capitalize">
                    {primaryRole.replace('_', ' ')}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/billing')}>Billing</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/api-keys')}>API Keys</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive cursor-pointer"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
