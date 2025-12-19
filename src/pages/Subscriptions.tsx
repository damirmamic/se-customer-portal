import { MainLayout } from "@/components/layout/MainLayout";
import { CreditCard, Users, Server, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const subscriptions = [
  {
    id: "sub-001",
    name: "Enterprise Production",
    plan: "Enterprise",
    status: "active",
    resources: 124,
    users: 45,
    spending: 12450,
    budget: 15000,
    renewalDate: "2024-03-15",
    offers: ["Premium Support", "Dedicated Infrastructure", "99.99% SLA"],
  },
  {
    id: "sub-002",
    name: "Development",
    plan: "Professional",
    status: "active",
    resources: 67,
    users: 23,
    spending: 3200,
    budget: 5000,
    renewalDate: "2024-02-28",
    offers: ["Standard Support", "Shared Infrastructure", "99.9% SLA"],
  },
  {
    id: "sub-003",
    name: "Analytics",
    plan: "Enterprise",
    status: "active",
    resources: 34,
    users: 12,
    spending: 4800,
    budget: 5000,
    renewalDate: "2024-04-01",
    offers: ["Premium Support", "Data Processing Add-on", "99.95% SLA"],
  },
  {
    id: "sub-004",
    name: "Enterprise Backup",
    plan: "Enterprise",
    status: "active",
    resources: 23,
    users: 8,
    spending: 2100,
    budget: 3000,
    renewalDate: "2024-03-20",
    offers: ["Backup & DR", "Geo-Redundant Storage", "99.99% SLA"],
  },
];

const planColors = {
  Enterprise: "bg-primary/20 text-primary border-primary/30",
  Professional: "bg-info/20 text-info border-info/30",
  Starter: "bg-muted text-muted-foreground border-border",
};

export default function Subscriptions() {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
            <p className="text-muted-foreground">
              Manage your subscription offers and billing
            </p>
          </div>
          <Button variant="glow">
            <CreditCard className="w-4 h-4 mr-2" />
            Add Subscription
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="glass-card p-6 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-foreground">{sub.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={cn(planColors[sub.plan as keyof typeof planColors])}
                    >
                      {sub.plan}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">{sub.id}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <Server className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-semibold">{sub.resources}</p>
                  <p className="text-xs text-muted-foreground">Resources</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <Users className="w-5 h-5 mx-auto text-info mb-1" />
                  <p className="text-lg font-semibold">{sub.users}</p>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <Calendar className="w-5 h-5 mx-auto text-success mb-1" />
                  <p className="text-sm font-semibold">{sub.renewalDate}</p>
                  <p className="text-xs text-muted-foreground">Renewal</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Budget Usage</span>
                  <span className="font-medium">
                    ${sub.spending.toLocaleString()} / ${sub.budget.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={(sub.spending / sub.budget) * 100} 
                  className={cn(
                    "h-2",
                    sub.spending / sub.budget > 0.9 
                      ? "[&>div]:bg-destructive" 
                      : sub.spending / sub.budget > 0.7 
                      ? "[&>div]:bg-warning" 
                      : "[&>div]:bg-success"
                  )}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {sub.offers.map((offer) => (
                  <Badge key={offer} variant="secondary" className="text-xs">
                    {offer}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
