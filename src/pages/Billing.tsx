import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Download, 
  Calendar,
  TrendingUp,
  Zap,
  Server,
  Database,
  HardDrive,
  ArrowUpRight,
  Check
} from "lucide-react";

const currentPlan = {
  name: "Enterprise",
  price: 2499,
  billingCycle: "monthly",
  nextBillingDate: "January 15, 2025",
  features: [
    "Unlimited resources",
    "24/7 Premium support",
    "99.99% SLA guarantee",
    "Custom integrations",
    "Dedicated account manager",
    "Advanced security features",
  ],
};

const usage = [
  {
    name: "Compute Hours",
    used: 8450,
    limit: 10000,
    unit: "hours",
    icon: <Server className="w-4 h-4" />,
  },
  {
    name: "Storage",
    used: 450,
    limit: 500,
    unit: "GB",
    icon: <HardDrive className="w-4 h-4" />,
  },
  {
    name: "Database Queries",
    used: 2800000,
    limit: 5000000,
    unit: "queries",
    icon: <Database className="w-4 h-4" />,
  },
  {
    name: "API Requests",
    used: 45000000,
    limit: 100000000,
    unit: "requests",
    icon: <Zap className="w-4 h-4" />,
  },
];

const invoices = [
  { id: "INV-2024-012", date: "Dec 15, 2024", amount: 2499, status: "paid" },
  { id: "INV-2024-011", date: "Nov 15, 2024", amount: 2499, status: "paid" },
  { id: "INV-2024-010", date: "Oct 15, 2024", amount: 2499, status: "paid" },
  { id: "INV-2024-009", date: "Sep 15, 2024", amount: 2499, status: "paid" },
  { id: "INV-2024-008", date: "Aug 15, 2024", amount: 2376, status: "paid" },
];

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const Billing = () => {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing</h1>
            <p className="text-muted-foreground">Manage your subscription and payment methods</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All Invoices
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan */}
          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Current Plan
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      {currentPlan.name}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Your subscription details and features</CardDescription>
                </div>
                <Button>
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-foreground">${currentPlan.price}</span>
                <span className="text-muted-foreground">/{currentPlan.billingCycle}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {currentPlan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Next billing date: {currentPlan.nextBillingDate}
                </div>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Payment Method</CardTitle>
              <CardDescription>Your default payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/2026</p>
                </div>
                <Badge variant="outline">Default</Badge>
              </div>
              <Button variant="outline" className="w-full">
                Update Payment Method
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Usage */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Current Usage
                </CardTitle>
                <CardDescription>Your resource consumption this billing period</CardDescription>
              </div>
              <Badge variant="outline">Resets Jan 15, 2025</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {usage.map((item) => {
                const percentage = (item.used / item.limit) * 100;
                return (
                  <div key={item.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-primary">{item.icon}</div>
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatNumber(item.used)} {item.unit}</span>
                      <span>{formatNumber(item.limit)} limit</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>Download and view your past invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Download className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">{invoice.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-foreground">${invoice.amount.toFixed(2)}</span>
                    <Badge
                      variant="outline"
                      className={invoice.status === "paid" ? "text-success border-success/30" : ""}
                    >
                      {invoice.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Billing;
