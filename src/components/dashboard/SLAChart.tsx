import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { time: "00:00", uptime: 99.99 },
  { time: "04:00", uptime: 99.98 },
  { time: "08:00", uptime: 99.95 },
  { time: "12:00", uptime: 99.97 },
  { time: "16:00", uptime: 99.92 },
  { time: "20:00", uptime: 99.96 },
  { time: "24:00", uptime: 99.99 },
];

export function SLAChart() {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-foreground">SLA Compliance</h2>
          <p className="text-sm text-muted-foreground">Last 24 hours uptime</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-success">99.97%</p>
          <p className="text-xs text-muted-foreground">Target: 99.95%</p>
        </div>
      </div>

      <div className="h-48">
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
              domain={[99.9, 100]}
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
              formatter={(value: number) => [`${value}%`, "Uptime"]}
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
      </div>
    </div>
  );
}
