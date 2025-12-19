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

const actions = [
  { name: "Initiate Backup", icon: Database, color: "text-primary" },
  { name: "Disaster Recovery", icon: Shield, color: "text-warning" },
  { name: "Scale Resources", icon: Scale, color: "text-success" },
  { name: "Create Incident", icon: AlertTriangle, color: "text-destructive" },
  { name: "Run Diagnostics", icon: Terminal, color: "text-info" },
  { name: "View Logs", icon: FileText, color: "text-muted-foreground" },
  { name: "Network Health", icon: Network, color: "text-primary" },
  { name: "Refresh Status", icon: RefreshCw, color: "text-muted-foreground" },
];

export function QuickActions() {
  return (
    <div className="glass-card p-4">
      <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Button
            key={action.name}
            variant="ghost"
            className="h-auto py-3 px-3 justify-start gap-3 hover:bg-muted/50"
          >
            <action.icon className={`w-4 h-4 ${action.color}`} />
            <span className="text-sm">{action.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
