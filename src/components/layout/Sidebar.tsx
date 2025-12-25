import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Server,
  Activity,
  Settings,
  Shield,
  Database,
  Users,
  ChevronLeft,
  ChevronRight,
  Zap,
  AlertTriangle,
  HardDrive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import schneiderLogo from "@/assets/schneider-electric-logo.svg";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { name: "Resources", href: "/resources", icon: Server },
  { name: "Health & SLA", href: "/health", icon: Activity },
  { name: "Operations", href: "/operations", icon: Zap },
  { name: "Incidents", href: "/incidents", icon: AlertTriangle },
  { name: "Backup & DR", href: "/backup", icon: Database },
  { name: "Storage", href: "/storage", icon: HardDrive },
  { name: "Security", href: "/security", icon: Shield },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Schneider Electric Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img 
            src={schneiderLogo} 
            alt="Schneider Electric" 
            className={cn(
              "h-8 object-contain transition-all duration-300",
              collapsed ? "w-8" : "w-full max-w-[180px]"
            )}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={cn(
                    "nav-item",
                    isActive && "nav-item-active"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="icon"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
