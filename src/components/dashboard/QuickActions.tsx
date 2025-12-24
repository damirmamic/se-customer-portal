import {
  Database,
  RefreshCw,
  Shield,
  AlertTriangle,
  Scale,
  Terminal,
  FileText,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onRefresh?: () => void;
  loading?: boolean;
}

const actions = [
  { name: "Initiate Backup", icon: Database, color: "text-primary", href: "/backup" },
  { name: "Disaster Recovery", icon: Shield, color: "text-warning", href: "/backup" },
  { name: "Scale Resources", icon: Scale, color: "text-success", href: "/resources" },
  { name: "Create Incident", icon: AlertTriangle, color: "text-destructive", href: "/incidents" },
  { name: "Run Diagnostics", icon: Terminal, color: "text-info", href: "/health" },
  { name: "View Logs", icon: FileText, color: "text-muted-foreground", href: "/operations" },
  { name: "Network Health", icon: Network, color: "text-primary", href: "/health" },
];

export function QuickActions({ onRefresh, loading }: QuickActionsProps) {
  return (
    <div className="glass-card p-4">
      <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Button
            key={action.name}
            variant="ghost"
            className="h-auto py-3 px-3 justify-start gap-3 hover:bg-muted/50"
            asChild
          >
            <a href={action.href}>
              <action.icon className={`w-4 h-4 ${action.color}`} />
              <span className="text-sm">{action.name}</span>
            </a>
          </Button>
        ))}
        <Button
          variant="ghost"
          className="h-auto py-3 px-3 justify-start gap-3 hover:bg-muted/50"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh Status</span>
        </Button>
      </div>
    </div>
  );
}
