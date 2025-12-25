import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAzureMonitor } from "@/hooks/useAzureMonitor";
import { Loader2 } from "lucide-react";

export function SLAChart() {
  const { resources, loading } = useAzureMonitor();

  // Calculate health percentage from resources
  const healthyCount = resources.filter(r => r.status === 'healthy').length;
  const totalCount = resources.length;
  const healthPercentage = totalCount > 0 ? ((healthyCount / totalCount) * 100).toFixed(2) : "—";

  // Generate placeholder data based on current health
  const currentHealth = totalCount > 0 ? (healthyCount / totalCount) * 100 : 99.95;
  const data = [
    { time: "00:00", uptime: Math.min(100, currentHealth + Math.random() * 0.05) },
    { time: "04:00", uptime: Math.min(100, currentHealth + Math.random() * 0.05) },
    { time: "08:00", uptime: Math.min(100, currentHealth - Math.random() * 0.05) },
    { time: "12:00", uptime: Math.min(100, currentHealth + Math.random() * 0.03) },
    { time: "16:00", uptime: Math.min(100, currentHealth - Math.random() * 0.08) },
    { time: "20:00", uptime: Math.min(100, currentHealth + Math.random() * 0.04) },
    { time: "24:00", uptime: currentHealth },
  ].map(d => ({ ...d, uptime: Number(d.uptime.toFixed(2)) }));

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-foreground">SLA Compliance</h2>
          <p className="text-sm text-muted-foreground">Resource health status</p>
        </div>
        <div className="text-right">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <>
              <p className="text-2xl font-bold text-success">{healthPercentage}%</p>
              <p className="text-xs text-muted-foreground">
                {healthyCount}/{totalCount} healthy
              </p>
            </>
          )}
        </div>
      </div>

      <div className="h-48">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : totalCount === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No resource data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(173 80% 40%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(173 80% 40%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(222 30% 18%)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }}
              />
              <YAxis
                domain={[Math.max(0, currentHealth - 1), 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222 47% 10%)",
                  border: "1px solid hsl(222 30% 18%)",
                  borderRadius: "8px",
                  color: "hsl(210 40% 98%)",
                }}
                formatter={(value: number) => [`${value}%`, "Health"]}
              />
              <Area
                type="monotone"
                dataKey="uptime"
                stroke="hsl(173 80% 40%)"
                strokeWidth={2}
                fill="url(#uptimeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
