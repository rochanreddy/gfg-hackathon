import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from "recharts";
import type { ChartData } from "@/utils/mockApi";
import { TrendingUp, TrendingDown } from "lucide-react";

const COLORS = [
  "hsl(217, 91%, 60%)",   // primary blue
  "hsl(262, 83%, 58%)",   // accent purple
  "hsl(142, 71%, 45%)",   // green
  "hsl(38, 92%, 50%)",    // amber
  "hsl(0, 84%, 60%)",     // red
  "hsl(190, 90%, 50%)",   // cyan
];

interface ChartRendererProps {
  chart: ChartData;
}

/** Renders the appropriate chart type based on chart.type */
const ChartRenderer = ({ chart }: ChartRendererProps) => {
  const { type, data, xKey, yKey } = chart;

  // KPI card
  if (type === "kpi") {
    const isPositive = (chart.change ?? 0) >= 0;
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 py-4">
        <span className="text-4xl font-display font-bold text-foreground">
          {chart.unit}{chart.value?.toLocaleString()}
        </span>
        {chart.change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-green-500" : "text-destructive"}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {isPositive ? "+" : ""}{chart.change}%
          </div>
        )}
      </div>
    );
  }

  // Line chart
  if (type === "line") {
    const keys = Object.keys(data[0] || {}).filter((k) => k !== xKey);
    return (
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
          <Legend />
          {keys.map((key, i) => (
            <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Bar chart
  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey={yKey!} radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Area chart
  if (type === "area") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
          <Area type="monotone" dataKey={yKey!} stroke={COLORS[0]} strokeWidth={2} fill="url(#areaGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Pie chart
  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} strokeWidth={2} stroke="hsl(var(--card))">
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
};

export default ChartRenderer;
